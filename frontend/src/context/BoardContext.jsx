import { useCallback, useEffect, useState } from "react";
import { BoardsContext } from "./createContext";
import { boardApi } from "../lib/api";

export const BoardsProvider = ({ children }) => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await boardApi.list();
      setBoards(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadBoards = async () => {
      try {
        const data = await boardApi.list();

        if (mounted) {
          setBoards(data);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadBoards();

    return () => {
      mounted = false;
    };
  }, []);

  const create = useCallback(async (data) => {
    const board = await boardApi.create(data);
    setBoards((prev) => [board, ...prev]);
    return board;
  }, []);

  return (
    <BoardsContext.Provider
      value={{
        boards,
        loading,
        refresh,
        create,
      }}
    >
      {children}
    </BoardsContext.Provider>
  );
};
