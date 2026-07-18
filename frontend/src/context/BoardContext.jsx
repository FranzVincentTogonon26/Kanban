import { useCallback, useEffect, useMemo, useState } from "react";

import { BoardsContext } from "./createContext";
import { boardApi } from "../lib/api";

export const BoardsProvider = ({ children }) => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await boardApi.list();
      setBoards(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await boardApi.list();
        if (!ignore) {
          setBoards(data);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const createBoard = useCallback(async (payload) => {
    const board = await boardApi.create(payload);
    setBoards((prev) => [board, ...prev]);
    return board;
  }, []);

  const updateBoard = useCallback(async (id, payload) => {
    const board = await boardApi.update(id, payload);
    setBoards((prev) => prev.map((item) => (item.id === id ? board : item)));
    return board;
  }, []);

  const deleteBoard = useCallback(async (id) => {
    await boardApi.remove(id);
    setBoards((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      boards,
      loading,
      refresh,
      createBoard,
      updateBoard,
      deleteBoard,
    }),
    [boards, loading, refresh, createBoard, updateBoard, deleteBoard],
  );

  return (
    <BoardsContext.Provider value={value}>{children}</BoardsContext.Provider>
  );
};
