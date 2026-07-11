import Activity from "../models/activity.model.js";

let io = null;

const setIO = (instance) => {
  io = instance;
};

const boardRoom = (boardId) => `board:${boardId}`;

const emitToBoard = (boardId, event, payload) => {
  if (io) io.to(boardRoom(boardId)).emit(event, payload);
};

const logActivity = async ({ boardId, userId, action, message, metadata }) => {
  const activity = await Activity.createActivity({
    boardId,
    userId,
    action,
    message,
    metadata,
  });

  emitToBoard(boardId, "activity:new", activity);
  return activity;
};

export { setIO, emitToBoard, logActivity, boardRoom };
