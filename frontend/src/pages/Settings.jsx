import { Command, LogOut, Zap } from "lucide-react";
import Topbar from "../components/layout/Topbar";
import Avatar from "../components/ui/Avatar";
import { useAuth, useLayout } from "../hooks/useContext";
import Button from "../components/ui/Button";
import { useNavigate } from "react-router-dom";

const Card = ({ title, description, children }) => (
  <section className="rounded-3xl border border-line bg-surface p-6 shadow-[var(--shadow-card)]">
    <h3 className="font-display text-sm font-semibold tracking-tight">
      {title}
    </h3>
    {description && <p className="mt-1 text-xs text-muted">{description}</p>}
    <div className="mt-5">{children}</div>
  </section>
);

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { openCreateBoard } = useLayout();

  return (
    <>
      <Topbar
        title="Settings"
        subtitle="Profile and preferences"
        onCreateBoard={openCreateBoard}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl space-y-5 px-6 py-8 md:px-8">
          {/* Profile */}
          <Card
            title="Profile"
            description="How you appear across your workspace."
          >
            <div className="flex items-center gap-4">
              <Avatar
                name={user?.name}
                id={user?.id}
                src={user?.avatar_url}
                size="lg"
                className="h-16 w-16 text-lg"
              />
              <div className="min-w-0">
                <p className="font-display text-lg font-semibold tracking-tight">
                  {user?.name}
                </p>
                <p className="truncate text-sm text-muted">{user?.email}</p>
              </div>
            </div>
          </Card>

          {/* Command */}
          <Card title="Command menu">
            <div className="mt-5 flex items-center justify-between ">
              <div>
                <p className="mt-0.5 text-xs text-muted">
                  Jump anywhere, search boards, create tasks.
                </p>
              </div>
              <kbd className="flex items-center gap-0.5 rounded-md bg-surface-2 px-2 py-1 text-[11px] font-semibold text-muted">
                <Command className="h-3 w-3" />K
              </kbd>
            </div>
          </Card>

          {/* About */}
          <Card title="About">
            <div className="flex items-center gap-3">
              <div className="brand-gradient flex h-10 w-10 items-center justify-center rounded-2xl shadow-[var(--shadow-brand)]">
                <Zap className="h-5 w-5 fill-white text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">Flowboard</p>
                <p className="text-xs text-muted">
                  AI-powered Kanban · Light theme
                </p>
              </div>
            </div>
          </Card>

          {/* Account */}
          <Card title="Account" description="Manage your session.">
            <Button
              variant="danger"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Settings;
