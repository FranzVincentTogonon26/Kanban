import { query } from "../config/db.js";

class AI {
  // Get the column
  static async getColumn(columnId, boardId) {
    const result = await query(
      "SELECT id FROM columns WHERE id = $1 AND board_id $2",
      [columnId, boardId],
    );

    return result.rows[0];
  }

  //   Get task by column
  static async getTaskColumn() {
    const result = await query(
      "SELECT COALESCE(MAX(position), 0) AS pos FROM tasks WHERE column_id $1",
      [columnId],
    );

    return result.rows[0];
  }

  //   Create generated task
  static async addGeneratedTask(
    boardId,
    columnId,
    suggestion_title,
    suggestion_description,
    suggestion_priority,
    pos,
    userId,
  ) {
    const result = await query(
      `
        INSERT INTO tasks ( board_id, column_id, title, description, priority, creates_by )
            VALUES ( $1, $2, $3, $4, $5, $6, $7 ) RETURNING *`,
      [
        boardId,
        columnId,
        suggestion_title,
        suggestion_description,
        suggestion_priority,
        post,
        userId,
      ],
    );

    return result.rows[0];
  }

  // Select task to breakdown
  static async breakdownTask(taskId, boardId) {
    const result = await query(
      "SELECT title, description FROM tasks WHERE id = $1 AND board_id = $2",
      [taskId, boardId],
    );

    return result.rows[0];
  }

  // Summarized Board
  // Get board by id
  static async summarizeBoard(boardId) {
    return Promise.all([
      query("SELECT title FROM boards WHERE id = $1", [boardId]),
      query(
        "SELECT id, title FROM columns WHERE board_id = $1 ORDER BY position ASC",
        [boardId],
      ),
      query(
        "SELECT column_id, title, priority FROM tasks WHERE board_id = $1",
        [boardId],
      ),
    ]);
  }
}

export default AI;
