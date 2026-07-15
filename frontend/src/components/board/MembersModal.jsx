import Modal from "../ui/Modal";
import { Input } from "../ui/Input";
import Button from "../ui/Button";
import { UserPlus, X } from "lucide-react";
import Avatar from "../ui/Avatar";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { boardApi } from "../../lib/api";

const MembersModal = ({
  open,
  onClose,
  boardId,
  members,
  setMembers,
  canManage,
  ownerId,
}) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const deleteTimers = useRef(new Map());

  const invite = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const member = await boardApi.addMember(boardId, {
        ownerId,
        email: email.trim(),
      });
      setMembers((prev) => {
        const exists = prev.find((m) => m.id === member.id);
        return exists
          ? prev.map((m) => (m.id === member.id ? { ...m, ...member } : m))
          : [...prev, member];
      });
      toast.success(`${member.name} added`);
      setEmail("");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const remove = (userId) => {
    const member = members.find((m) => m.id === userId);
    if (!member) return;

    // Remove immediately from UI
    setMembers((prev) => prev.filter((m) => m.id !== userId));

    const timer = setTimeout(async () => {
      try {
        await boardApi.removeMember(boardId, userId);
      } catch (err) {
        // Restore if API fails
        setMembers((prev) => [...prev, member]);
        toast.error(err.message);
      } finally {
        deleteTimers.current.delete(userId);
      }
    }, 5000);

    deleteTimers.current.set(userId, timer);

    toast(
      (t) => (
        <div className="flex items-center gap-3">
          <span>
            <strong>{member.name}</strong> removed
          </span>

          <button
            className="font-medium text-primary hover:underline"
            onClick={() => {
              clearTimeout(deleteTimers.current.get(userId));
              deleteTimers.current.delete(userId);

              setMembers((prev) => [...prev, member]);

              toast.dismiss(t.id);
            }}
          >
            Undo
          </button>
        </div>
      ),
      {
        duration: 5000,
      },
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Members"
      description="Invite teammates to collaborate in real time."
    >
      {canManage && (
        <form onSubmit={invite} className="mb-5 flex gap-2">
          <Input
            placeholder="teammate@email.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" loading={loading} className="shrink-0">
            <UserPlus className="h-4 w-4" /> Invite
          </Button>
        </form>
      )}

      <ul className="space-y-1">
        {members.map((m) => (
          <li
            key={m.id}
            className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-surface-2"
          >
            <Avatar name={m.name} id={m.id} src={m.avatar_url} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{m.name}</p>
              <p className="truncate text-xs text-faint">{m.email}</p>
            </div>
            <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-medium capitalize text-muted">
              {m.role}
            </span>
            {canManage && m.id !== ownerId && (
              <button
                onClick={() => remove(m.id)}
                className="rounded-full p-1.5 text-faint transition-colors hover:bg-elevated hover:text-priority-urgent"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </li>
        ))}
      </ul>
    </Modal>
  );
};

export default MembersModal;
