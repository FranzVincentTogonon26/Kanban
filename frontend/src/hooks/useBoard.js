import { useCallback, useEffect, useState } from "react";
import { boardApi, columnApi, taskApi } from "../lib/api";
import toast from "react-hot-toast";

export const useBoard = (boardId) => {
  const [board, setBoard] = useState(null);
  const [columns, setColumns] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [role, setRole] = useState("member");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [presence, setPresence] = useState([]);

  // Initial load
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    boardApi
      .get(boardId)
      .then((data) => {
        if (!alive) return;
        setBoard(data.board);
        setColumns(data.columns);
        setTasks(data.tasks);
        setMembers(data.members);
        setRole(data.role);
      })
      .catch((err) => alive && setError(err.message))
      .finally(() => alive && setLoading(false));
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
        setColumns((p) => [...p, col].sort((a, b) => a.position - b.position));
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
        await taskApi.move(boardId, taskId, { column_id: columnId, position });
      } catch (err) {
        upsertTask(prev);
        toast.error(err.message);
      }
    },
    [boardId, tasks, upsertTask],
  );

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
    // upsertTask,
    addColumn,
    // renameColumn,
    // deleteColumn,
  };
};
