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

// prettier-ignore
router.get("/:boardId/activity",boardAccessMiddleware,boardController.getActivity);

// prettier-ignore
router.post("/:boardId/members",boardAccessMiddleware,boardController.addMember);
// prettier-ignore
router.delete("/:boardId/members/:userId",boardAccessMiddleware,boardController.removeMember);

/*
 * Columns Controller Routes
 */

// prettier-ignore
router.post("/:boardId/columns",boardAccessMiddleware,columnController.createColumn);
// prettier-ignore
router.patch("/:boardId/columns/:columnId",boardAccessMiddleware,columnController.updateColumn);
// prettier-ignore
router.delete("/:boardId/columns/:columnId",boardAccessMiddleware,columnController.deleteColumn);

/*
 * Tasks Controller Routes
 */

// prettier-ignore
router.get("/:boardId/tasks", boardAccessMiddleware, taskController.listTask);
// prettier-ignore
router.post("/:boardId/tasks", boardAccessMiddleware, taskController.createTask );
// prettier-ignore
router.patch("/:boardId/tasks/:tasksId", boardAccessMiddleware, taskController.updateTask );
// prettier-ignore
router.patch("/:boardId/tasks/:tasksId/move", boardAccessMiddleware, taskController.moveTask );
// prettier-ignore
router.delete("/:boardId/tasks/:taskId", boardAccessMiddleware, taskController.deleteTask );

/*
 * AI Controller Routes
 */

// prettier-ignore
router.post("/:boardId/ai/generate-tasks", boardAccessMiddleware, aiController.generateTask,);
// prettier-ignore
router.post("/:boardId/ai/breakdown", boardAccessMiddleware, aiController.breakdownTask);
// prettier-ignore
router.post("/:boardId/ai/summary", boardAccessMiddleware, aiController.summarizeBoard);

export default router;
