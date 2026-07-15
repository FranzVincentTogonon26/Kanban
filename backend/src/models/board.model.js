import { query, withTransaction } from "../config/db.js";

class Board {
  // Create Activities Logs
  static async getBoardAccess(boardId, userId) {
    const result = await query(
      "SELECT b.id, b.owner_id, m.role FROM boards b LEFT JOIN board_members m ON m.board_id = b.id AND m.user_id = $2 WHERE b.id = $1",
      [boardId, userId],
    );

    return result.rows[0];
  }

  // Lists Boards
  static async listBoards(userId) {
    const result = await query(
      `SELECT 
          b.*, 
          ( b.owner_id = $1 ) AS is_owner, 
          ( SELECT COUNT(*) FROM tasks t WHERE t.board_id = b.id ) AS task_count,
          ( SELECT COUNT(*) FROM board_members m WHERE m.board_id = b.id ) AS member_count 
       FROM boards b 
          LEFT JOIN board_members mm 
          ON mm.board_id = b.id 
          AND mm.user_id = $1 
       WHERE b.owner_id = $1 OR mm.user_id = $1 
       ORDER BY b.updated_at DESC`,
      [userId],
    );

    return result.rows;
  }

  // Create Board
  static async createBoard(
    title,
    description,
    color,
    user_id,
    DEFAULT_COLUMNS,
  ) {
    const result = await withTransaction(async (client) => {
      const board = await client.query(
        `INSERT INTO boards ( title, description, color, owner_id ) VALUES ( $1, $2, $3, $4 ) RETURNING *`,
        [title, description, color, user_id],
      );

      const b = board.rows[0];

      await client.query(
        `INSERT INTO board_members ( board_id, user_id, role ) VALUES ( $1, $2, 'owner')`,
        [b.id, user_id],
      );

      for (let i = 0; i < DEFAULT_COLUMNS.length; i++) {
        await client.query(
          `INSERT INTO columns ( board_id, title, position ) VALUES ( $1, $2, $3 )`,
          [b.id, DEFAULT_COLUMNS[i], (i + 1) * 1000],
        );
      }

      return b;
    });

    return result;
  }

  // Get board by id
  static async getBoard(boardId) {
    return Promise.all([
      query("SELECT * FROM boards WHERE id = $1", [boardId]),
      query("SELECT * FROM columns WHERE board_id = $1 ORDER BY position ASC", [
        boardId,
      ]),
      query(
        `SELECT 
            t.*,
            a.name AS assignee_name,
            a.email AS assignee_email,
            a.avatar_url AS assignee_avatar
         FROM tasks t
         LEFT JOIN users a ON a.id = t.assigned_id
         WHERE t.board_id = $1
         ORDER BY t.position ASC`,
        [boardId],
      ),
      query(
        `SELECT u.id, u.name, u.email, u.avatar_url, m.role, m.joined_at
         FROM board_members m JOIN users u ON u.id = m.user_id
         WHERE m.board_id = $1 ORDER BY m.joined_at ASC`,
        [boardId],
      ),
    ]);
  }

  // Update Board
  static async updateBoard(userId, title, description, color) {
    const result = await query(
      `UPDATE boards
          SET title = COALESCE($2, title),
              description = COALESCE($3, description),
              color = COALESCE($4, color),
              updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [userId, title ?? null, description ?? null, color ?? null],
    );

    return result.rows[0];
  }

  // Dekete Board
  static async deleteBoard(boardId) {
    const result = await query("DELETE FROM boards WHERE id = $1", [boardId]);
    return result.rows[0];
  }

  // Create board members
  static async createBoardMember(boardId, userId, role) {
    const result = await query(
      `INSERT INTO board_members ( board_id, user_id, role) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (board_id, user_id) DO UPDATE SET role = EXCLUDED.role`,
      [boardId, userId, role],
    );

    return result.rows[0];
  }

  // Remove board member
  static async removeBoardMember(boardId, userId) {
    const result = await query(
      "DELETE FROM board_members WHERE board_id = $1 AND user_id = $2",
      [boardId, userId],
    );
    return result.rows[0];
  }
}

export default Board;
