import Avatar from "../ui/Avatar";
import Modal from "../ui/Modal";

const MembersPresenceModal = ({ open, onClose, membersPresence }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Members Presence"
      description="Know who is viewing and working on the board."
    >
      {membersPresence.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <p className="text-sm font-medium text-muted">No active members</p>
        </div>
      ) : (
        <ul className="space-y-1">
          {membersPresence.map((m) => (
            <li
              key={m.id}
              className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-surface-2"
            >
              <Avatar name={m.name} id={m.id} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{m.name}</p>
                <p className="truncate text-xs text-faint">{m.email}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
};

export default MembersPresenceModal;
