import { BoardsContext } from "./createContext";

export const BoardsProvider = ({ children }) => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);

  return (
    <BoardsContext.Provider value={{ boards, loading }}>
      {children}
    </BoardsContext.Provider>
  );
};
