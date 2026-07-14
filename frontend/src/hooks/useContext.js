import { useContext } from "react";
import {
  AuthContext,
  LayoutContext,
  BoardsContext,
} from "../context/createContext";

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const useLayout = () => {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error("useLayout must be used within LayoutInner");
  return ctx;
};

export const useBoards = () => {
  const ctx = useContext(BoardsContext);
  if (!ctx) throw new Error("useBoards must be used within BoardsProvider");
  return ctx;
};
