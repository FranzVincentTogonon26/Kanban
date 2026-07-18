import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useBoards } from "../../hooks/useContext";
import { cn } from "../../lib/utils";

import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { Input, Textarea } from "../ui/Input";
import { Trash2 } from "lucide-react";

const COLORS = [
  "#2f8159",
  "#2c9c8f",
  "#6f9b54",
  "#d4a23c",
  "#c26a45",
  "#5f7da6",
];

const getInitialForm = (board) => ({
  title: board?.title ?? "",
  description: board?.description ?? "",
  color: board?.color ?? COLORS[0],
});

const Form = ({ board, isEdit, onClose }) => {
  const deleteTimers = useRef(new Map());
  const { createBoard, updateBoard, deleteBoard } = useBoards();
  const navigate = useNavigate();

  const [form, setForm] = useState(() => getInitialForm(board));
  const [loading, setLoading] = useState(false);

  const handleChange = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    const title = form.title.trim();
    if (!title) return;

    setLoading(true);

    try {
      if (isEdit) {
        await updateBoard(board.id, { ...form, title });
        toast.success("Board updated");
      } else {
        const newBoard = await createBoard({ ...form, title });
        toast.success("Board created");
        if (newBoard?.id) {
          navigate(`/board/${newBoard.id}`);
        }
      }

      onClose();
    } catch (err) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const timer = setTimeout(async () => {
      try {
        await deleteBoard(board.id);
        onClose();
        navigate(`/dashboard`);
      } catch (err) {
        toast.error(err.message);
      } finally {
        deleteTimers.current.delete(board.id);
      }
    }, 5000);

    deleteTimers.current.set(board.id, timer);

    toast(
      (t) => (
        <div className="flex items-center gap-3">
          <span>Board deleted</span>

          <button
            className="font-medium text-blue-600 hover:underline"
            onClick={() => {
              const timer = deleteTimers.current.get(board.id);

              if (timer) {
                clearTimeout(timer);
                deleteTimers.current.delete(board.id);
                toast.dismiss(t.id);
                toast.success("Board restored");
              }
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Board name"
        placeholder="Product Roadmap"
        autoFocus
        value={form.title}
        onChange={(e) => handleChange("title", e.target.value)}
      />

      <Textarea
        label="Description (optional)"
        rows={3}
        placeholder="What is this board about?"
        value={form.description}
        onChange={(e) => handleChange("description", e.target.value)}
      />

      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-muted">
          Accent color
        </label>

        <div className="flex gap-2">
          {COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => handleChange("color", color)}
              className={cn(
                "h-7 w-7 rounded-full transition-transform",
                form.color === color
                  ? "ring-2 ring-ink/70 ring-offset-2 ring-offset-surface"
                  : "hover:scale-110",
              )}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-5">
        <div>
          {isEdit && (
            <Button
              type="button"
              variant="ghost"
              onClick={handleDelete}
              className="text-priority-urgent"
            >
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button type="submit" loading={loading}>
            {isEdit ? "Update board" : "Create board"}
          </Button>
        </div>
      </div>
    </form>
  );
};

const CreateBoardModal = ({ open, board, onClose }) => {
  const isEdit = Boolean(board?.id);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit board" : "Create a board"}
      description={
        isEdit
          ? "Update the board name, description or accent color."
          : "Boards start with Todo, In Progress, Review and Done."
      }
    >
      {open && (
        <Form
          key={board?.id ?? "new"}
          board={board}
          isEdit={isEdit}
          onClose={onClose}
        />
      )}
    </Modal>
  );
};

export default CreateBoardModal;
