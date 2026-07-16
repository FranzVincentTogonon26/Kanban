import Column from "../models/column.model.js";
import { emitToBoard, logActivity } from "../realtime/index.js";
import ApiError from "../utils/ApiError.js";
import { addColumnSchema } from "../validations/column.validation.js";

export const createColumn = async (req, res, next) => {
  try {
    const validationResult = addColumnSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues.map(
        (err) => err.message,
      );
      throw ApiError.badRequest(errorMessages.join(", "));
    }

    const { title } = validationResult.data;
    const column = await Column.createColumn(req.board.id, title);

    emitToBoard(req.board.id, "column:created", column);
    res.status(201).json({ column: column });
  } catch (err) {
    next(err);
  }
};

export const updateColumn = async (req, res, next) => {
  try {
    const { title, position } = req.body;

    const column = await Column.getColumn(req.params.columnId, req.board.id);
    if (!column) throw ApiError.notFound("Column not found");

    const updateColumn = await Column.updateColumn(
      req.params.columnId,
      req.board.id,
      title,
      position,
    );

    emitToBoard(req.board.id, "column:updated", updateColumn);
    await logActivity({
      boardId: req.board.id,
      userId: req.user.id,
      action: "column.updated",
      message: `${req.user.name} rename "${column.title}" to "${title}"`,
      metadata: { columnId: column.id },
    });

    res.json({ column: updateColumn });
  } catch (err) {
    next(err);
  }
};

export const deleteColumn = async (req, res, next) => {
  try {
    const column = await Column.deleteColumn(req.params.columnId, req.board.id);
    if (!column.length) throw ApiError.notFound("Column not found");
    emitToBoard(req.board.id, "column:deleted", column);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
