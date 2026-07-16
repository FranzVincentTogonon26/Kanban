import { Bell, Command, Plus, Search } from "lucide-react";
import { useLayout } from "../../hooks/useContext";
import Button from "../ui/Button";

const Topbar = ({ title, subtitle, actions, onCreateBoard }) => {
  const { openCommand } = useLayout();

  const capitalizedSubtitle = subtitle
    ? subtitle.charAt(0).toUpperCase() + subtitle.slice(1)
    : "";

  return (
    <header className="sticky top-0 z-20 flex h-[72px] items-center gap-4 border-b px-6">
      <div className="min-w-0 shrink">
        {title && (
          <h1 className="truncate font-display text-lg font-bold leading-tight tracking-tight text-ink">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="truncate text-xs text-muted">{capitalizedSubtitle}</p>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2.5">
        {/* Search → command menu */}
        <button
          onClick={openCommand}
          className="hidden h-10 w-56 items-center gap-2.5 rounded-full border border-line bg-surface px-4 text-sm text-faint shadow-[var(--shadow-card)] transition-all duration-200 hover:border-brand-300 hover:text-muted hover:shadow-[var(--shadow-soft)] md:flex lg:w-64"
        >
          <Search className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">Search tasks, boards…</span>
          <kbd className="flex items-center gap-0.5 rounded-md bg-surface-2 px-1.5 py-0.5 text-[10px] font-semibold text-muted">
            <Command className="h-3 w-3" />K
          </kbd>
        </button>

        {actions}

        <button
          className="tooltip tooltip-bottom hidden h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-muted shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-px hover:text-ink hover:shadow-[var(--shadow-soft)] sm:flex"
          data-tip="Notifications"
        >
          <Bell className="h-4.5 w-4.5" />
        </button>

        <Button
          size="md"
          onClick={onCreateBoard}
          className="hidden sm:inline-flex"
        >
          <Plus className="h-4 w-4" /> New board
        </Button>
      </div>
    </header>
  );
};

export default Topbar;
