import { Link, useParams } from "react-router-dom";

import Topbar from "../components/layout/Topbar";
import { AvatarStack } from "../components/ui/Avatar";
import {
  Activity,
  ChevronLeft,
  FileText,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { useBoard } from "../hooks/useBoard";
import { useLayout } from "../hooks/useContext";
import Button from "../components/ui/Button";
import { useMemo, useState } from "react";
import ActivityFeed from "../components/board/ActivityFeed";
import MembersModal from "../components/board/MembersModal";
import { FilterSelect } from "../components/ui/Input";
import { PRIORITIES, titleCase } from "../lib/utils";
import { ColumnSkeleton } from "../components/ui/Skeleton";
import KanbanBoard from "../components/board/KanbanBoard";
import TaskModal from "../components/board/TaskModal";
// import toast from "react-hot-toast";

// import { aiApi } from "../lib/api";
import PromptDialog from "../components/ui/PromptDialog";
import MembersPresenceModal from "../components/board/MembersPresenceModal";
import AISummaryModal from "../components/ai/AISummaryModal";
import AIGenerateModal from "../components/ai/AIGenerateModal";

const BoardPage = () => {
  const { boardId } = useParams();
  const { openCreateBoard } = useLayout();

  const getBoard = useBoard(boardId);

  const [taskModal, setTaskModal] = useState({
    open: false,
    task: null,
    columnId: null,
  });
  const [aiGen, setAiGen] = useState({ open: false, columnId: null });
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [membersPresenceOpen, setMembersPresenceOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const [addColumnOpen, setAddColumnOpen] = useState(false);

  const [filterPriority, setFilterPriority] = useState("");
  const [filterAssignee, setFilterAssignee] = useState("");
  const [search, setSearch] = useState("");

  const filteredTasks = useMemo(() => {
    return getBoard.tasks.filter((t) => {
      if (filterPriority && t.priority !== filterPriority) return false;
      if (filterAssignee && t.assigned_id !== filterAssignee) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !t.title.toLowerCase().includes(q) &&
          !(t.description || "").toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [getBoard.tasks, filterPriority, filterAssignee, search]);

  const canManage =
    getBoard.role.toLowerCase() === "owner" ||
    getBoard.role.toLowerCase() === "admin";

  const actions = (
    <div className="flex items-center gap-2">
      {getBoard.presence.length > 0 && (
        <div className=" hidden items-center gap-1 sm:flex">
          <Button
            size="xs"
            variant="ghost"
            onClick={() => setMembersPresenceOpen(true)}
          >
            <AvatarStack users={getBoard.presence} size="xs" max={3} />
          </Button>
        </div>
      )}
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setActivityOpen(true)}
        title="Activity"
      >
        <Activity className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setMembersOpen(true)}
        title="Members"
      >
        <Users className="h-4 w-4" />
      </Button>
      <Button size="sm" variant="outline" onClick={() => setSummaryOpen(true)}>
        <FileText className="h-4 w-4" />{" "}
        <span className="hidden lg:inline">Summary</span>
      </Button>
      {/* <Button
        size="sm"
        onClick={() =>
          setAiGen({ open: true, columnId: getBoard.columns?.[0].id })
        }
      >
        <Sparkles className="h-4 w-4" />{" "}
        <span className="hidden lg:inline">AI tasks</span>
      </Button> */}
    </div>
  );

  return (
    <>
      <Topbar
        title={
          <span className="flex items-center gap-2">
            <Link
              to="/dashboard"
              className="text-faint hover:text-ink md:hidden"
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
            {getBoard.board ? (
              <>
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: getBoard.board.color }}
                />
                {titleCase(getBoard.board.title)}
              </>
            ) : (
              "Loading..."
            )}
          </span>
        }
        subtitle={getBoard.board ? getBoard.board.description : ""}
        actions={actions}
        onCreateBoard={openCreateBoard}
      />

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2.5 px-6 py-3.5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-faint" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks"
            className="h-9 w-80 rounded-full border border-line bg-surface pl-9 pr-4 text-sm shadow-[var(--shadow-card)] outline-none transition-all duration-200 focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/15"
          />
        </div>
        <FilterSelect
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
        >
          <option value="">All priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect
          value={filterAssignee}
          onChange={(e) => setFilterAssignee(e.target.value)}
        >
          <option value="">All assignees</option>
          {getBoard.members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </FilterSelect>
        {(filterPriority || filterAssignee || search) && (
          <button
            onClick={() => {
              setFilterPriority("");
              setFilterAssignee("");
              setSearch("");
            }}
            className="rounded-full px-3 py-1.5 text-sm font-medium text-muted bg-surface-2 transition-colors hover:bg-priority-urgent/10 hover:text-priority-urgent"
          >
            Clear
          </button>
        )}
        <span className="ml-auto rounded-full bg-surface-2 px-3 py-1 text-sm font-medium tabular text-muted">
          {filteredTasks.length} tasks
        </span>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-hidden pt-5">
        {getBoard.loading ? (
          <div className="flex gap-4 px-6">
            {[0, 1, 2, 3].map((i) => (
              <ColumnSkeleton key={i} />
            ))}
          </div>
        ) : (
          <KanbanBoard
            columns={getBoard.columns}
            tasks={filteredTasks}
            actions={getBoard}
            onTaskClick={(task) =>
              setTaskModal({ open: true, task, columnId: task.column_id })
            }
            onAddTask={(columnId) =>
              setTaskModal({ open: true, task: null, columnId })
            }
            onAddColumn={() => setAddColumnOpen(true)}
          />
        )}
      </div>

      {/* Modals */}
      <TaskModal
        key={taskModal.task?.id ?? `new-${taskModal.columnId ?? "default"}`}
        open={taskModal.open}
        onClose={() =>
          setTaskModal({ open: false, task: null, columnId: null })
        }
        task={taskModal.task}
        defaultColumnId={taskModal.columnId}
        columns={getBoard.columns}
        members={getBoard.members}
        actions={getBoard}
      />

      <ActivityFeed
        open={activityOpen}
        onClose={() => setActivityOpen(false)}
        boardId={boardId}
      />

      <AIGenerateModal
        open={aiGen.open}
        onClose={() => setAiGen({ open: false, columnId: null })}
        boardId={boardId}
        columns={getBoard.columns}
        defaultColumnId={aiGen.columnId}
        onCreated={(tasks) => tasks.forEach(getBoard.upsertTask)}
      />
      <AISummaryModal
        open={summaryOpen}
        onClose={() => setSummaryOpen(false)}
        boardId={boardId}
      />

      <MembersModal
        open={membersOpen}
        onClose={() => setMembersOpen(false)}
        boardId={boardId}
        members={getBoard.members}
        setMembers={getBoard.setMembers}
        canManage={canManage}
        ownerId={getBoard.board?.owner_id}
      />

      <MembersPresenceModal
        open={membersPresenceOpen}
        onClose={() => setMembersPresenceOpen(false)}
        membersPresence={getBoard.presence}
      />

      {addColumnOpen && (
        <PromptDialog
          open
          onClose={() => setAddColumnOpen(false)}
          title="Add column"
          description="Give your new column a name."
          label="Column name"
          placeholder="e.g. Backlog"
          submitLabel="Add column"
          onSubmit={(name) => {
            getBoard.addColumn(name);
            setAddColumnOpen(false);
          }}
        />
      )}
    </>
  );
};

export default BoardPage;
