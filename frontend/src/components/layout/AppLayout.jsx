import { useCallback, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import { cn } from "../../lib/utils";
import { LayoutContext } from "../../context/createContext";
import { BoardsProvider } from "../../context/BoardContext";

import Sidebar from "./Sidebar";
import CreateBoardModal from "../board/CreateBoardModal";
import CommandMenu from "./CommandMenu";

const SIDEBAR_STORAGE_KEY = "sidebar-collapsed";

const LayoutInner = () => {
  const [createBoard, setCreateBoard] = useState({
    open: false,
    board: null,
  });

  const [commandOpen, setCommandOpen] = useState(false);

  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true",
  );

  const openCreateBoard = useCallback((board = null) => {
    setCreateBoard({
      open: true,
      board,
    });
  }, []);

  const closeCreateBoard = useCallback(() => {
    setCreateBoard({
      open: false,
      board: null,
    });
  }, []);

  const openCommand = useCallback(() => {
    setCommandOpen(true);
  }, []);

  const closeCommand = useCallback(() => {
    setCommandOpen(false);
  }, []);

  const toggleSidebar = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed));
  }, [collapsed]);

  // ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <LayoutContext.Provider
      value={{
        openCreateBoard,
        openCommand,
      }}
    >
      <div className="h-screen overflow-hidden">
        <Sidebar
          collapsed={collapsed}
          onToggle={toggleSidebar}
          onCreateBoard={openCreateBoard}
        />

        <main
          className={cn(
            "flex h-screen min-w-0 flex-col overflow-hidden transition-[padding] duration-300 ease-[var(--ease-spring)]",
            collapsed ? "md:pl-[92px]" : "md:pl-[280px]",
          )}
        >
          <Outlet />
        </main>
      </div>

      <CreateBoardModal
        open={createBoard.open}
        board={createBoard.board}
        onClose={closeCreateBoard}
      />

      <CommandMenu
        open={commandOpen}
        onClose={closeCommand}
        onCreateBoard={() => {
          closeCommand();
          openCreateBoard();
        }}
      />
    </LayoutContext.Provider>
  );
};

const AppLayout = () => (
  <BoardsProvider>
    <LayoutInner />
  </BoardsProvider>
);

export default AppLayout;
