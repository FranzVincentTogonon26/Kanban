import Task from "../models/task.model.js";
import { addTaskSchema } from "../validations/task.validation.js";
import ApiError from "../utils/ApiError.js";
import { emitToBoard, logActivity } from "../realtime";

const PRIORITIES = ["low", "medium", "high", "urgent"];

const listTask = async (req, res, next) => {
  try {
    const tasks = await Task.listTask(
      req.board.id,
      req.query.priority,
      req.query.assignee,
      req.query.column,
      req.query.q,
    );

    res.json({ tasks: tasks });
  } catch (err) {
    next(err);
  }
};

const createtask = async (req, res, next) => {
  try {
    const validationResult = addColumnSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues.map(
        (err) => err.message,
      );
      throw ApiError.badRequest(errorMessages.join(", "));
    }

    const {
      column_id,
      title: rawTitle,
      description,
      due_date,
      assignee_id,
    } = validationResult.data;
    const priority = PRIORITIES.includes(req.body.priority)
      ? req.body.priority
      : "medium";

    const ensureTask = await Task.ensureColumnInBoard(column_id, req.board.id);
    if (!ensureTask.length)
      throw ApiError.badRequest("Column does not belong to this board");

    const newTask = await Task.createTask(
      column_id,
      req.board.id,
      title,
      description,
      priority,
      due_date,
      assignee_id,
      req.user.id,
    );

    const task = await Task.fetchTask(newTask.id);
    emitToBoard(req.board.id, "task:created", task);
    await logActivity({
      boardId: req.board.id,
      userId: req.user.id,
      action: "task.created",
      message: `${req.user.name} created "${task.title}"`,
      metadata: { taskId: task.id },
    });

    res.status(201).json({ task });
  } catch (err) {
    next(err);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const { title, description, priority, due_date, assignee_id } = req.body;
    if (priority !== undefined && !PRIORITIES.includes(priority))
      throw ApiError.badRequest("Invalid Priority");

    const updateTask = await Task.updateTask(
      req.params.taskId,
      req.board.id,
      title,
      description,
      priority,
      due_date,
      assignee_id,
    );

    if (!updateTask) throw ApiError.notFound("Task not found..");

    const task = await Task.fetchTask(updateTask.id);
    emitToBoard(req.board.id, "task:updated", task);
    res.json({ task });
  } catch (err) {
    next(err);
  }
};

const moveTask = async (req, res, next) => {
  try {
    const { column_id, position } = req.body;
    if (!column_id || position === undefined) {
      throw ApiError.badRequest("Column Id and position are required");
    }

    await Task.ensureColumnInBoard(column_id, req.board.id);

    const prevRes = await Task.getColumnIdMove(req.params.taskId, req.board.id);
    if (!prevRes.length) throw ApiError.notFound("Task not found..");
    const movedColumn = prevRes.column_id !== column_id;

    const moveTask = await Task.moveTask(
      req.params.taskId,
      req.board.id,
      column_id,
      position,
    );

    const task = await Task.fetchTask(moveTask.id);
    emitToBoard(req.board.id, "task:moved", task);

    if (movedColumn) {
      const colRes = await Task.getMoveColumnById(column_id);
      await logActivity({
        boardId: req.board.id,
        userId: req.user.id,
        action: "task.moved",
        message: `${req.user.name} moved "${task.title}" to ${colRes.title}`,
        metadata: { taskId: task.id, columnId: column_id },
      });
    }

    res.json({ task });
  } catch (err) {
    next(err);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.deleteTask(req.params.taskId, req.board.id);
    if (!task.length) throw ApiError.notFound("Task not found");

    emitToBoard(req.board.id, "task:deleted", { id: req.params.taskId });
    await logActivity({
      boardId: req.board.id,
      userId: req.user.id,
      action: "task.deleted",
      message: `${req.user.name} deleted "${task.title}"`,
      metadata: { taskId: req.params.taskId },
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

export { listTask, createtask, updateTask, moveTask, deleteTask };
