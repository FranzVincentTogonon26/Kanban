import ApiError from "../utils/ApiError.js";
import * as Service from "../services/ai.service.js";
import AI from "../models/ai.model.js";
import { emitToBoard, logActivity } from "../realtime/index.js";

export const generateTask = async (req, res, next) => {
  try {
    console.log(req.body);

    const goal = (req.body.goal || "").trim();
    if (!goal) throw ApiError.badRequest("A project goal is required");

    const count = Math.min(Math.max(parseInt(req.body.count, 10) || 6, 1), 15);

    const suggestions = await Service.generateServiceTask(goal, count);

    if (!req.body.column_id) {
      return res.json({ tasks: suggestions, persisted: false });
    }

    const colRes = await AI.getColumn(req.body.column_id, req.board.id);
    if (!colRes.length)
      throw ApiError.badRequest("Column id does not belong to this board");

    const baseRes = await AI.getTaskColumn(req.body.column_id);
    let pos = Number(baseRes.pos);
    const created = [];

    for (const s of suggestions) {
      const task = await AI.addGeneratedTask(
        req.board.id,
        req.body.column_id,
        s.title,
        s.description,
        s.priority,
        ++pos,
        req.user.id,
      );

      created.push(task);
      emitToBoard(req.board.id, "task:created", task);
    }

    await logActivity({
      boardId: req.board.id,
      userId: req.user.id,
      action: "ai:generated_tasks",
      message: `${req.user.name} generated ${created.length} tasks with AI`,
      metadata: { goal, count: created.length },
    });

    res.status(201).json({ tasks: created, persisted: true });
  } catch (err) {
    next(err);
  }
};

export const breakdownTask = async (req, res, next) => {
  try {
    let { title, description } = req.body;
    const count = Math.min(Math.max(parseInt(req.body.count, 10) || 5, 1), 12);

    if (req.body.taskId) {
      const task = await AI.breakdownTask(req.body.taskId, req.board.id);
      if (!task) throw ApiError.notFound("Task not found..");
      title = task.title;
      description = task.description;
    }

    if (!title)
      throw ApiError.badRequest("A task title ( or taskId ) is required");

    const subtasks = await Service.breakdownTask(title, description, count);
    res.json({ subtasks });
  } catch (err) {
    next(err);
  }
};

export const summarizeBoard = async (req, res, next) => {
  try {
    const [boardRes, colsRes, tasksRes] = await AI.summarizeBoard(req.board.id);
    const columns = colsRes.rows.map((c) => ({
      title: c.title,
      tasks: tasksRes.rows.filter((t) => t.column_id === c.id),
    }));

    const summary = await Service.summarizeBoard({
      boardTitle: boardRes.rows[0]?.title || "Board",
      columns,
    });

    res.json({ summary });
  } catch (err) {
    next(err);
  }
};
