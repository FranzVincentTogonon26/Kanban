import { useEffect, useMemo } from "react";
import {
  ArrowUpRight,
  CheckSquare,
  FolderKanban,
  KanbanIcon,
  LayoutGrid,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import { useAuth, useBoards, useLayout } from "../hooks/useContext";
import { cn, relativeTime } from "../lib/utils";

import Topbar from "../components/layout/Topbar";
import { BoardCardSkeleton } from "../components/ui/Skeleton";

const Dashboard = () => {
  const { openCreateBoard } = useLayout();
  const { user } = useAuth();
  const { boards, loading, refresh } = useBoards();

  useEffect(() => {
    refresh();
  }, [refresh]);

  const stats = useMemo(() => {
    const totalTasks = boards.reduce(
      (sum, b) => sum + Number(b.task_count || 0),
      0,
    );
    const owned = boards.filter((b) => b.is_owner).length;
    const shared = boards.filter((b) => !b.is_owner).length;
    return { total: boards.length, totalTasks, owned, shared };
  }, [boards]);

  const avgPerBoard = stats.total
    ? Math.round(stats.totalTasks / stats.total)
    : 0;

  // Real per-board task distributions feeding the KPI mini bar charts.
  const trends = useMemo(() => {
    const sizes = boards.map((b) => Number(b.task_count || 0));
    return {
      boards: sizes,
      tasks: [...sizes].sort((a, b) => b - a),
      owned: boards
        .filter((b) => b.is_owner)
        .map((b) => Number(b.task_count || 0)),
      shared: boards
        .filter((b) => !b.is_owner)
        .map((b) => Number(b.task_count || 0)),
    };
  }, [boards]);

  return (
    <>
      <Topbar
        title="Dashboard"
        subtitle="Your boards and shared projects"
        onCreateBoard={openCreateBoard}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1600px] px-6 py-8 md:px-8">
          {/* Greeting */}
          <div className="mb-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-500">
              Workspace Overview
            </p>
            <h2 className="mt-2 font-display text-[clamp(26px,3vw,34px)] font-semibold leading-tight tracking-tight">
              Welcome back, {user?.name?.split(" ")[0]} 👋
            </h2>
          </div>

          {/* KPIs */}
          <div className="mb-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-2">
            <KpiCard
              featured
              label="Total boards"
              value={stats.total}
              hint="Across your workspace"
              trend={trends.boards}
              icon={FolderKanban}
            />
            <KpiCard
              label="Total tasks"
              value={stats.totalTasks}
              hint={`${avgPerBoard} avg per board`}
              trend={trends.tasks}
              icon={CheckSquare}
            />
          </div>

          <div className="mb-5 flex items-end justify-between">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
              All boards
            </h3>
          </div>

          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <BoardCardSkeleton key={i} />
              ))}
            </div>
          ) : boards.length === 0 ? (
            <div className="card flex flex-col items-center justify-center gap-4 rounded-3xl py-20 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-500">
                <KanbanIcon className="h-7 w-7" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold tracking-tight">
                  Create your first board
                </h3>
                <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted">
                  Spin up a board and let AI generate your first set of tasks
                  from a simple goal.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {boards.map((b, i) => (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: (i % 6) * 0.05,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <Link
                    to={`/board/${b.id}`}
                    className="group relative block h-full overflow-hidden rounded-3xl border-2 border-line bg-surface p-5 shadow-[var(--shadow-card)] transition-shadow duration-300 hover:shadow-[var(--shadow-soft)]"
                  >
                    {/* color accent strip */}
                    <div className="mb-3.5 flex items-start justify-between">
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-2xl"
                        style={{
                          backgroundColor: `${b.color || "#2f8159"}1f`,
                          color: b.color || "#2f8159",
                        }}
                      >
                        <LayoutGrid className="h-5 w-5" />
                      </div>
                      <span className="flex items-center gap-1.5 text-faint transition-all duration-200 group-hover:text-brand-500">
                        {!b.is_owner && (
                          <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted">
                            Shared
                          </span>
                        )}
                        <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </span>
                    </div>
                    <h4 className="font-display text-base font-semibold tracking-tight transition-colors group-hover:text-brand-600">
                      {b.title}
                    </h4>
                    <p className="mt-1.5 line-clamp-2 min-h-10 text-sm leading-relaxed text-muted">
                      {b.description || "No description"}
                    </p>
                    <div className="mt-4 flex items-center gap-4 border-t pt-3.5 text-xs text-faint">
                      <span className="flex items-center gap-1.5 tabular">
                        <CheckSquare className="h-3.5 w-3.5" /> {b.task_count}{" "}
                        tasks
                      </span>
                      <span className="flex items-center gap-1.5 tabular">
                        <Users className="h-3.5 w-3.5" /> {b.member_count}
                      </span>
                      <span className="ml-auto">
                        {relativeTime(b.updated_at)}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// ── KPI card (bento style — big number, icon medallion, contextual hint) ──
const KpiCard = ({
  label,
  value,
  hint,
  featured,
  trend,
  icon: Icon = ArrowUpRight,
}) => (
  <div
    className={cn(
      "group relative overflow-hidden rounded-3xl p-5 transition-shadow duration-300",
      featured
        ? "brand-gradient text-white shadow-[var(--shadow-brand)]"
        : "border border-line bg-surface text-ink hover:shadow-[var(--shadow-soft)]",
    )}
  >
    {featured && (
      <>
        <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-white/15 blur-xl" />
        <div className="absolute -bottom-12 -left-6 h-24 w-24 rounded-full bg-white/10 blur-xl" />
      </>
    )}
    <div className="relative">
      <div className="mb-7 flex items-start justify-between gap-2">
        <span
          className={cn(
            "text-[15px] font-medium",
            featured ? "text-white/90" : "text-ink",
          )}
        >
          {label}
        </span>
        <span
          className={cn(
            "grid h-9 w-9 shrink-0 place-items-center rounded-2xl transition-colors duration-200",
            featured
              ? "bg-white/20 text-white"
              : "bg-brand-50 text-brand-600 group-hover:bg-brand-100",
          )}
        >
          <Icon className="h-[18px] w-[18px]" />
        </span>
      </div>
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-[40px] font-semibold leading-none tracking-tight tabular">
            {value}
          </p>
          {hint && (
            <p
              className={cn(
                "mt-3 text-xs",
                featured ? "text-white/75" : "text-muted",
              )}
            >
              {hint}
            </p>
          )}
        </div>
        {trend && trend.length >= 2 && (
          <Sparkbars data={trend} featured={featured} />
        )}
      </div>
    </div>
  </div>
);

// ── Mini bar chart for the KPI corner (per-board task distribution) ────────
const Sparkbars = ({ data, featured }) => {
  const bars = data.slice(-11);
  const max = Math.max(1, ...bars);
  const peak = Math.max(...bars);
  return (
    <div className="flex h-10 items-end gap-[3px]" aria-hidden="true">
      {bars.map((v, i) => (
        <span
          key={i}
          className={cn(
            "w-1.5 rounded-full",
            featured
              ? "bg-white/45"
              : v === peak
                ? "bg-brand-500"
                : "bg-brand-300",
          )}
          style={{ height: `${Math.max((v / max) * 100, 14)}%` }}
        />
      ))}
    </div>
  );
};

export default Dashboard;
