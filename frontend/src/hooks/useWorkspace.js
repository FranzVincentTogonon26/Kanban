import { useEffect, useMemo, useState } from "react";
import { boardApi } from "../lib/api";
import { useBoards } from "../hooks/useContext";

export const useWorkspace = () => {
  const { boards, loading: boardsLoading } = useBoards();

  const [workspace, setWorkspace] = useState({
    tasks: [],
    members: [],
  });

  // console.log(workspace);

  useEffect(() => {
    if (boardsLoading) return;

    let cancelled = false;

    const loadWorkspace = async () => {
      if (!boards.length) {
        if (!cancelled) {
          setWorkspace({
            tasks: [],
            members: [],
          });
        }
        return;
      }

      const results = await Promise.all(
        boards.map((board) => boardApi.get(board.id).catch(() => null)),
      );

      if (cancelled) return;

      const tasks = [];
      const memberMap = new Map();

      results.forEach((res, index) => {
        if (!res) return;

        const board = res.board ?? boards[index];

        const columnMap = Object.fromEntries(
          (res.columns ?? []).map((column) => [column.id, column.title]),
        );

        (res.tasks ?? []).forEach((task) => {
          tasks.push({
            ...task,
            board_id: board[0].id,
            board_title: board[0].title,
            board_color: board[0].color,
            status: columnMap[task.column_id] ?? "",
          });
        });

        (res.members ?? []).forEach((member) => {
          const existing = memberMap.get(member.id);

          if (existing) {
            if (!existing.boards.includes(board[0].title)) {
              existing.boards.push(board[0].title);
            }
            return;
          }

          memberMap.set(member.id, {
            ...member,
            boards: [board[0].title],
          });
        });
      });

      setWorkspace({
        tasks,
        members: [...memberMap.values()],
      });
    };

    loadWorkspace();

    return () => {
      cancelled = true;
    };
  }, [boards, boardsLoading]);

  const loading = useMemo(
    () => boardsLoading || (boards.length > 0 && workspace.tasks.length === 0),
    [boardsLoading, boards.length, workspace.tasks.length],
  );

  return {
    boards,
    tasks: workspace.tasks,
    members: workspace.members,
    loading,
  };
};
