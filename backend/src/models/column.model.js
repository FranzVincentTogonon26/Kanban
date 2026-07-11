import { query } from "../config/db.js";

class Column {
  // Carete Column
  static async createColumn(boardId, title) {
    const posRes = await query(
      "SELECT COALESCE(MAX(position), 0) + 1000 AS pos FROM columns WHERE board_id = $1",
      [boardId],
    );

    const result = await query(
      "INSERT INTO columns (board_id, title, position) VALUES ($1,$2,$3) RETURNING *",
      [boardId, title, posRes.rows[0].pos],
    );

    return result.rows[0];
  }

  //   Update column
  static async updateColumn(columnId, boardId, title, position) {
    const result = await query(
      `UPDATE columns
            SET title = COALESCE( $3, title),
                position = COALESCE( $4, position)
         WHERE id = $1 AND board_id = $2
         RETURNING *`,
      [columnId, boardId, title ?? null, position ?? null],
    );

    return result.rows[0];
  }

  //   Delete column
  static async deleteColumn(columnId, boardId) {
    const result = await query(
      "DELETE FROM columns WHERE id = $1 AND board_id = $2 RETURNING *",
      [columnId, boardId],
    );

    return result.rows;
  }
}

export default Column;
