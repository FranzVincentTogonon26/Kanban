import { cn } from "../../lib/utils";

const labelCls = "block text-sm font-medium tracking-tight text-muted";

export const Input = ({ label, error, className, id, ...props }) => (
  <div className="space-y-1.5">
    {label && (
      <label htmlFor={id} className={labelCls}>
        {label}
      </label>
    )}
    <input
      id={id}
      className={cn(
        "input-base rounded-full",
        error && "!border-priority-urgent",
        className,
      )}
      {...props}
    />
    {error && <p className="text-xs text-priority-urgent">{error}</p>}
  </div>
);

export const Textarea = ({
  label,
  error,
  className,
  id,
  rows = 4,
  ...props
}) => (
  <div className="space-y-1.5">
    {label && (
      <label htmlFor={id} className={labelCls}>
        {label}
      </label>
    )}
    <textarea
      id={id}
      rows={rows}
      className={cn(
        "input-base resize-none rounded-2xl",
        error && "!border-priority-urgent",
        className,
      )}
      {...props}
    />
    {error && <p className="text-xs text-priority-urgent">{error}</p>}
  </div>
);

// Form select — appearance reset + custom chevron so it matches our inputs.
export const Select = ({ label, className, id, children, ...props }) => (
  <div className="space-y-1.5">
    {label && (
      <label htmlFor={id} className={labelCls}>
        {label}
      </label>
    )}
    <div className="relative">
      <select
        id={id}
        className={cn(
          "select input-base cursor-pointer rounded-full pr-10 border-line bg-surface text-ink shadow-[var(--shadow-card)] outline-none transition-all duration-200 hover:border-brand-300 focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/15",
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </div>
  </div>
);

// Compact pill select used in filter bars.
export const FilterSelect = ({ className, children, ...props }) => (
  <div className="relative">
    <select
      className={cn(
        "select rounded-full border border-line bg-surface h-9 cursor-pointer pl-4 pr-9 text-sm font-normal text-ink shadow-[var(--shadow-card)] outline-none transition-all duration-200 hover:border-brand-300 focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/15",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  </div>
);
