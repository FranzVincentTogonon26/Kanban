import Board from "../models/board.models.js";
import ApiError from "../utils/ApiError.js";

const requireBoardAccess = async (req, res, next) => {
  const boardId =
    req.params.boardId ||
    req.params.id ||
    req.body.board_id ||
    req.query.board_id;

  if (!boardId) throw ApiError.badRequest("Board id is required");

  const board = await Board.getBoardAccess(boardId, req.user.id);
  if (!board) throw ApiError.notFound("Board not found..");

  const isOwner = board.owner_id === req.user.id;
  if (!isOwner && !board.role) {
    throw ApiError.forbidden("You do not have access to this board..");
  }

  req.board = {
    id: board.id,
    owner_id: board.owner_id,
    role: isOwner ? "Owner" : board.role,
  };

  next();
};

export default requireBoardAccess;
