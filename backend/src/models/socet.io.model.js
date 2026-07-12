import { query } from "../config/db.js";

class SocketIO {
  // Get boards
  static async userCanAccessBoard(boardId, userId) {
    const result = await query(
      `SELECT 1 FROM boards b
       LEFT JOIN board_members m ON m.board_id = b.id AND m.user_id = $2
       WHERE b.id = $1 AND ( b.owner_id = $2 OR m.user_id = $2 )`,
      [boardId, userId],
    );

    return result.rows.length > 0;
  }
}

export default SocketIO;
