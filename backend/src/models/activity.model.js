import { query } from "../config/db.js";

class Activity {
  // Create Activities Logs
  static async createActivity({ boardId, userId, action, message, metadata }) {
    const result = await query(
      "INSERT INTO activities (board_id, user_id, action, message, metadata) VALUES ($1, $2, $3, $4, $5) RETURNING id, board_id, user_id, action, message, metadata, created_at",
      [
        boardId,
        userId || null,
        action,
        message,
        metadata ? JSON.stringify(metadata) : null,
      ],
    );

    return result.rows[0];
  }

  // Get Activity
  static async getActivity(boardId, limit) {
    const result = await query(
      `SELECT act.*, u.name AS user_name, u.avatar_url AS user_avatar
       FROM activities act LEFT JOIN users u ON u.id = act.user_id
       WHERE act.board_id = $1
       ORDER BY act.created_at DESC LIMIT $2`,
      [boardId, limit],
    );

    return result.rows;
  }
}

export default Activity;
