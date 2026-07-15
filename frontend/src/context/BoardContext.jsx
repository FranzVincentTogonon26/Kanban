import { useCallback, useEffect, useState } from "react";
import { BoardsContext } from "./createContext";
import { boardApi } from "../lib/api";

export const BoardsProvider = ({ children }) => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);

  const boardList = useCallback(async () => {
    try {
      setBoards(await boardApi.list());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    boardList();
  }, [boardList]);

  const create = useCallback(async (data) => {
    const board = await boardApi.create(data);
    setBoards((prev) => [board, ...prev]);
    return board;
  }, []);

  return (
    <BoardsContext.Provider value={{ boards, loading, create }}>
      {children}
    </BoardsContext.Provider>
  );
};
