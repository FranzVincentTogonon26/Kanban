import { useEffect, useState } from "react";
import { boardApi } from "../lib/api";

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
    // createTask,
    // updateTask,
    // deleteTask,
    // moveTask,
    // upsertTask,
    // addColumn,
    // renameColumn,
    // deleteColumn,
  };
};
