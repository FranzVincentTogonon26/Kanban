import { useCallback, useEffect, useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import toast from "react-hot-toast";

import { userApi } from "../../lib/api";
import { cn } from "../../lib/utils";
import ConfirmDialog from "../ui/ConfirmDialog";

const STATUS_ACTIONS = {
  pending: {
    label: "Approve",
    nextStatus: "active",
    success: "Approved.",
  },
  active: {
    label: "Suspend",
    nextStatus: "suspended",
    success: "Suspended.",
  },
  suspended: {
    label: "Activate",
    nextStatus: "active",
    success: "Activated.",
  },
};

const AccountAction = ({ user, onDelete, onUpdated }) => {
  const actionRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const action = STATUS_ACTIONS[user.status];

  const closeMenu = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event) => {
      if (!actionRef.current?.contains(event.target)) {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, closeMenu]);

  const handleStatusChange = async () => {
    if (!action || loading) return;

    closeMenu();
    setLoading(true);

    try {
      await userApi.update(user.id, action.nextStatus);
      toast.success(`${user.name} ${action.success}`);
      onUpdated?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    closeMenu();
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await userApi.delete(user.id);
      toast.success(`${user.name} deleted..`);
      onDelete?.(user.id);
    } finally {
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <div className="ml-auto flex items-center">
        <div ref={actionRef} className="relative">
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="rounded-lg p-1.5 text-faint transition-colors hover:bg-surface hover:text-ink"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {open && (
            <div className="card animate-in absolute right-0 z-10 mt-1 w-44 rounded-2xl p-1.5 shadow-[var(--shadow-lift)]">
              {action && (
                <MenuItem onClick={handleStatusChange}>{action.label}</MenuItem>
              )}

              <div className="my-1 border-t" />

              <MenuItem danger onClick={handleDelete}>
                Delete
              </MenuItem>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete user?"
        description={`"${user.name}" will be permanently removed. This action can't be undone.`}
        confirmLabel="Delete user"
        danger
      />
    </>
  );
};

const MenuItem = ({ children, onClick, danger = false }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm transition-colors hover:bg-surface-2",
      danger ? "text-priority-urgent" : "text-muted hover:text-ink",
    )}
  >
    {children}
  </button>
);

export default AccountAction;
