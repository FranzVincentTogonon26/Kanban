import Activity from "../models/activity.model.js";
import Board from "../models/board.model.js";
import User from "../models/user.model.js";
import { emitToBoard, logActivity } from "../realtime/index.js";
import ApiError from "../utils/ApiError.js";
import { memberSchema } from "../validations/activity.validation.js";

const DEFAULT_COLUMNS = ["Todo", "In Progress", "Review", "Done"];

export const listBoards = async (req, res, next) => {
  try {
    const boardList = await Board.listBoards(req.user.id);
    res.json({ boards: boardList });
  } catch (err) {
    next(err);
  }
};

export const createBoard = async (req, res, next) => {
  try {
    const title = (req.body.title || "").trim();
    const description = (req.body.description || "").trim() || null;
    const color = req.body.color || "#6366f1";

    if (!title) throw ApiError.badRequest("Board title is required..");

    const board = await Board.createBoard(
      title,
      description,
      color,
      req.user.id,
      DEFAULT_COLUMNS,
    );

    res.status(201).json({ board });
  } catch (err) {
    next(err);
  }
};

export const getBoard = async (req, res, next) => {
  try {
    const boardId = req.board.id;

    const [boardRes, columnsRes, tasksRes, membersRes] =
      await Board.getBoard(boardId);

    res.json({
      board: boardRes.rows,
      columns: columnsRes.rows,
      tasks: tasksRes.rows,
      members: membersRes.rows,
      role: req.board.role,
    });
  } catch (err) {
    next(err);
  }
};

export const updateBoard = async (req, res, next) => {
  try {
    const title = (req.body.title || "").trim();
    const description = (req.body.description || "").trim() || null;
    const color = req.body.color || "#6366f1";

    const board = await Board.updateBoard(
      req.board.id,
      title,
      description,
      color,
    );

    emitToBoard(req.board.id, "board:updated", board);
    res.json({ board: board });
  } catch (err) {
    next(err);
  }
};

export const deleteBoard = async (req, res, next) => {
  try {
    await Board.deleteBoard(req.board.id);
    emitToBoard(req.board.id, "board:deleted", { id: req.board.id });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

export const getActivity = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 30, 100);
    const activities = await Activity.getActivity(req.board.id, limit);
    res.json({ activities: activities });
  } catch (err) {
    next(err);
  }
};

export const addMember = async (req, res, next) => {
  try {
    if (!["owner", "admin"].includes(req.board.role.toLowerCase())) {
      throw ApiError.forbidden("Only owners or admin can add members");
    }

    const validationResult = memberSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues.map(
        (err) => err.message,
      );
      throw ApiError.badRequest(errorMessages.join(", "));
    }

    const { email } = validationResult.data;
    const role = req.body.role === "admin" ? "admin" : "member";

    const user = await User.findUserByEmail(email);
    if (!user) throw ApiError.notFound("No user found with that email");

    if (req.body.ownerId === user.id)
      throw ApiError.conflict("The board owner is already a member.");

    await Board.createBoardMember(req.board.id, user.id, role);
    await logActivity({
      boardId: req.board.id,
      userId: req.user.id,
      action: "member.added",
      message: `${req.user.name} added ${user.name} to the board`,
      metadata: { memberId: user.id },
    });

    res.status(201).json({
      member: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
        role,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const removeMember = async (req, res, next) => {
  try {
    if (!["owner", "admin"].includes(req.board.role.toLowerCase())) {
      throw ApiError.forbidden("Only owners or admin can add members");
    }

    const { userId } = req.params;
    if (userId === req.board.owner_id)
      throw ApiError.badRequest("Cannot remove the board owner");

    const user = await User.findUserById(userId);
    if (!user) throw ApiError.notFound("No user found with that email");

    await Board.removeBoardMember(req.board.id, userId);

    await logActivity({
      boardId: req.board.id,
      userId: req.board.owner_id,
      action: "member.remove",
      message: `${req.user.name} remove ${user.name} to the board`,
      metadata: { memberId: userId },
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
