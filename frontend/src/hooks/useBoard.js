import toast from "react-hot-toast";
import { useCallback, useEffect, useState } from "react";
import { boardApi, columnApi, taskApi } from "../lib/api";
import { connecSocket } from "../lib/socket";

export const useBoard = (boardId) => {
  const [board, setBoard] = useState(null);
  const [columns, setColumns] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [role, setRole] = useState("member");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [presence, setPresence] = useState([]);

  useEffect(() => {
    let alive = true;

    const loadBoard = async () => {
      try {
        const data = await boardApi.get(boardId);

        if (!alive) return;

        setBoard(data.board[0]);
        setColumns(data.columns);
        setTasks(data.tasks);
        setMembers(data.members);
        setRole(data.role);
        setError(null);
      } catch (err) {
        if (alive) setError(err.message);
      } finally {
        if (alive) setLoading(false);
      }
    };

    loadBoard();

    return () => {
      alive = false;
    };
  }, [boardId]);

  const removeTaskLocal = useCallback((id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const upsertTask = useCallback((task) => {
    setTasks((prev) => {
      const idx = prev.findIndex((t) => t.id === task.id);
      if (idx === -1) return [...prev, task];
      const next = [...prev];
      next[idx] = task;
      return next;
    });
  }, []);

  const addColumn = useCallback(
    async (title) => {
      try {
        const col = await columnApi.create(boardId, { title });
        setColumns((p) => {
          if (p.find((x) => x.id === col.id)) return p;
          return [...p, col].sort((a, b) => a.position - b.position);
        });
        toast.success("New Column Added");
      } catch (err) {
        toast.error(err.message);
      }
    },
    [boardId],
  );

  const createTask = useCallback(
    async (data) => {
      try {
        const task = await taskApi.create(boardId, data);
        upsertTask(task);
        return task;
      } catch (err) {
        toast.error(err.message);
        throw err;
      }
    },
    [boardId, upsertTask],
  );

  const updateTask = useCallback(
    async (taskId, data) => {
      const prev = tasks.find((t) => t.id === taskId);
      upsertTask({ ...prev, ...data }); // optimistic
      try {
        const task = await taskApi.update(boardId, taskId, data);
        upsertTask(task);
        return task;
      } catch (err) {
        if (prev) upsertTask(prev);
        toast.error(err.message);
        throw err;
      }
    },
    [boardId, tasks, upsertTask],
  );

  const deleteTask = useCallback(
    async (taskId) => {
      const prev = tasks.find((t) => t.id === taskId);
      removeTaskLocal(taskId);
      try {
        await taskApi.remove(boardId, taskId);
        toast.success("Task deleted");
      } catch (err) {
        if (prev) upsertTask(prev);
        toast.error(err.message);
      }
    },
    [boardId, tasks, removeTaskLocal, upsertTask],
  );

  // Apply a local move immediately, then persist.
  const moveTask = useCallback(
    async (taskId, columnId, position) => {
      const prev = tasks.find((t) => t.id === taskId);
      if (!prev) return;
      upsertTask({ ...prev, column_id: columnId, position });
      try {
        const moveTask = await taskApi.move(boardId, taskId, {
          column_id: columnId,
          position,
        });
        toast.success(`${moveTask.title} moved to ${moveTask.columnTitle}`);
      } catch (err) {
        upsertTask(prev);
        toast.error(err.message);
      }
    },
    [boardId, tasks, upsertTask],
  );

  const deleteColumn = useCallback(
    async (column) => {
      try {
        await columnApi.remove(boardId, column.id);
        setColumns((p) => p.filter((c) => c.id !== column.id));
        setTasks((p) => p.filter((t) => t.column_id !== column.id));
        toast.success(`${column.title} column deleted..`);
      } catch (err) {
        toast.error(err.message);
      }
    },
    [boardId],
  );

  const renameColumn = useCallback(
    async (columnId, title) => {
      setColumns((p) =>
        p.map((c) => (c.id === columnId ? { ...c, title } : c)),
      );
      try {
        await columnApi.update(boardId, columnId, { title });
        toast.success("Column Updated");
      } catch (err) {
        toast.error(err.message);
      }
    },
    [boardId],
  );

  // Real-time sync
  useEffect(() => {
    const socket = connecSocket();
    socket.emit("board:join", boardId);

    const onCreated = (t) => upsertTask(t);
    const onUpdated = (t) => upsertTask(t);
    const onMoved = (t) => upsertTask(t);
    const onDeleted = ({ id }) => removeTaskLocal(id);
    const onColCreated = (c) =>
      setColumns((p) => {
        if (p.find((x) => x.id === c.id)) return p;
        return [...p, c].sort((a, b) => a.position - b.position);
      });
    const onColUpdated = (c) =>
      setColumns((p) =>
        p
          .map((x) => (x.id === c.id ? c : x))
          .sort((a, b) => a.position - b.position),
      );
    const onColDeleted = ({ id }) =>
      setColumns((p) => p.filter((x) => x.id !== id));
    const onBoardUpdated = (b) => setBoard(b);
    const onPresenceSync = ({ users }) => setPresence(users || []);
    const onPresenceJoin = ({ user }) =>
      setPresence((p) => (p.find((u) => u.id === user.id) ? p : [...p, user]));
    const onPresenceLeave = ({ user }) =>
      setPresence((p) => p.filter((u) => u.id !== user.id));

    socket.on("task:created", onCreated);
    socket.on("task:updated", onUpdated);
    socket.on("task:moved", onMoved);
    socket.on("task:deleted", onDeleted);
    socket.on("column:created", onColCreated);
    socket.on("column:updated", onColUpdated);
    socket.on("column:deleted", onColDeleted);
    socket.on("board:updated", onBoardUpdated);
    socket.on("presence:sync", onPresenceSync);
    socket.on("presence:join", onPresenceJoin);
    socket.on("presence:leave", onPresenceLeave);

    return () => {
      socket.emit("board:leave", boardId);
      socket.off("task:created", onCreated);
      socket.off("task:updated", onUpdated);
      socket.off("task:moved", onMoved);
      socket.off("task:deleted", onDeleted);
      socket.off("column:created", onColCreated);
      socket.off("column:updated", onColUpdated);
      socket.off("column:deleted", onColDeleted);
      socket.off("board:updated", onBoardUpdated);
      socket.off("presence:sync", onPresenceSync);
      socket.off("presence:join", onPresenceJoin);
      socket.off("presence:leave", onPresenceLeave);
      setPresence([]);
    };
  }, [boardId, upsertTask, removeTaskLocal]);

  return {
    board,
    columns,
    tasks,
    members,
    role,
    loading,
    error,
    presence,
    setBoard,
    setMembers,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    upsertTask,
    addColumn,
    renameColumn,
    deleteColumn,
  };
};
