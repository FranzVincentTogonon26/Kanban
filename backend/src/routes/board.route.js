import express from "express";

import authMiddleware from "../middleware/auth.middleware.js";
import boardAccessMiddleware from "../middleware/board.access.middleware.js";

import * as boardController from "../controllers/board.controller.js";
import * as columnController from "../controllers/column.controller.js";
import * as taskController from "../controllers/task.controller.js";
import * as aiController from "../controllers/ai.controller.js";

const router = express.Router();

router.use(authMiddleware);

/*
 * Boards Controller Routes
 */

router.get("/", boardController.listBoards);
router.post("/", boardController.createBoard);

router.get("/:boardId", boardAccessMiddleware, boardController.getBoard);
router.patch("/:boardId", boardAccessMiddleware, boardController.updateBoard);
router.delete("/:boardId", boardAccessMiddleware, boardController.deleteBoard);

router.get(
  "/:boardId/activity",
  boardAccessMiddleware,
  boardController.getActivity,
);

router.post(
  "/:boardId/members",
  boardAccessMiddleware,
  boardController.addMember,
);
router.delete(
  "/:boardId/members/:userId",
  boardAccessMiddleware,
  boardController.removeMember,
);

/*
 * Columns Controller Routes
 */

router.post(
  "/:boardId/columns",
  boardAccessMiddleware,
  columnController.createColumn,
);
router.patch(
  "/:boardId/columns/:columnId",
  boardAccessMiddleware,
  columnController.updateColumn,
);
router.delete(
  "/:boardId/columns/:columnId",
  boardAccessMiddleware,
  columnController.deleteColumn,
);

/*
 * Tasks Controller Routes
 */

router.get("/:boardId/tasks", boardAccessMiddleware, taskController.listTask);
router.post(
  "/:boardId/tasks",
  boardAccessMiddleware,
  taskController.createTask,
);
router.patch(
  "/:boardId/tasks/:tasksId",
  boardAccessMiddleware,
  taskController.updateTask,
);
router.patch(
  "/:boardId/tasks/:tasksId/move",
  boardAccessMiddleware,
  taskController.moveTask,
);
router.delete(
  "/:boardId/tasks/:taskId",
  boardAccessMiddleware,
  taskController.deleteTask,
);

/*
 * AI Controller Routes
 */

router.post(
  "/:boardId/ai/generate-tasks",
  boardAccessMiddleware,
  aiController.generateTask,
);
router.post(
  "/:boardId/ai/breakdown",
  boardAccessMiddleware,
  aiController.breakdownTask,
);
router.post(
  "/:boardId/ai/summary",
  boardAccessMiddleware,
  aiController.summarizeBoard,
);

export default router;
