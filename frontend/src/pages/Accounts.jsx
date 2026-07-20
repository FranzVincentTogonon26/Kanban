import { useCallback } from "react";
import { Crown } from "lucide-react";
import Topbar from "../components/layout/Topbar";
import Avatar from "../components/ui/Avatar";
import Button from "../components/ui/Button";
import { useAuth, useLayout } from "../hooks/useContext";
import { cn, dateFormat } from "../lib/utils";

import AccountAction from "../components/account/AccountAction";

const Card = ({ title, description, children }) => (
  <section className="rounded-3xl border border-line bg-surface p-6 shadow-[var(--shadow-card)]">
    <h3 className="font-display text-sm font-semibold tracking-tight">
      {title}
    </h3>
    {description && <p className="mt-1 text-xs text-muted">{description}</p>}
    <div className="mt-5">{children}</div>
  </section>
);

// prettier-ignore
const roleTone = (role) => role === "admin" ? "bg-brand-50 text-brand-700" : "bg-[#FBF1E2] text-[#c28a3a]";

const statusTone = (status) =>
  status === "active"
    ? "bg-brand-50 text-brand-700"
    : status === "pending"
      ? "bg-[#FBF1E2] text-[#c28a3a]"
      : "bg-priority-urgent/10 text-priority-urgent";

const Accounts = () => {
  const { user, users, loading, refreshUser } = useAuth();
  const { openCreateBoard } = useLayout();

  const isAdmin = user?.role?.toLowerCase() === "admin";

  const handleChange = useCallback(() => {
    refreshUser();
  }, [refreshUser]);

  return (
    <>
      <Topbar
        title="Accounts"
        subtitle="Manage team accounts, roles, and access permissions."
        onCreateBoard={openCreateBoard}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl space-y-5 px-6 py-8 md:px-8">
          {/* Profile */}
          <Card
            title="My Profile"
            description="How you appear across your workspace."
          >
            <div className="flex items-center justify-between  gap-4">
              <div className="flex items-center gap-2">
                <Avatar
                  name={user?.name}
                  id={user?.id}
                  src={user?.avatar_url}
                  size="lg"
                  className="h-16 w-16 text-lg"
                />
                <div className="min-w-0">
                  <div className="font-display text-lg font-semibold tracking-wider">
                    {user?.name}
                    <span
                      className={cn(
                        "tracking-wider ml-3 mt-3 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium capitalize",
                        roleTone(user.role),
                      )}
                    >
                      {user.role.toUpperCase()}
                    </span>
                  </div>
                  <p className="truncate text-sm text-muted">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Button type="submit">Update Profile</Button>
              </div>
            </div>
          </Card>

          {/* Account */}
          {isAdmin && (
            <Card
              title="Members"
              description="View and manage all user accounts."
            >
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="skeleton h-13 rounded-2xl" />
                  ))}
                </div>
              ) : users.length === 0 ? (
                <p className="px-2 py-8 text-center text-sm font-bold text-muted">
                  No members yet.
                </p>
              ) : (
                <ul className="space-y-1">
                  {users.map((user) => (
                    <li
                      key={user.id}
                      className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-surface-2"
                    >
                      <Avatar
                        name={user.name}
                        id={user.id}
                        src={user.avatar_url}
                        size="sm"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {user.name}
                        </p>
                        <p className="truncate text-xs text-faint">
                          {user.email}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-[11px] font-medium capitalize",
                          statusTone(user.status),
                        )}
                      >
                        {user.status === "owner" && (
                          <Crown className="h-3 w-3" />
                        )}
                        {user.status || "member"}
                      </span>
                      <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-medium capitalize text-muted">
                        {dateFormat(user.created_at)}
                      </span>
                      <AccountAction
                        user={user}
                        onDelete={handleChange}
                        onUpdated={handleChange}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default Accounts;
