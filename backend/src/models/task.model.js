import { query } from "../config/db.js";

class Task {
  // Fetch task
  static async fetchTask(taskId) {
    const result = await query(
      `SELECT 
                t.*, 
                a.name AS assignee_name,
                a.email AS assignee_email,
                a.avatar_url AS assignee_avatar
             FROM tasks t
             LEFT JOIN users a ON a.id = t.assigned_id
             WHERE t.id = $1`,
      [taskId],
    );
    return result.rows[0];
  }

  //   Ensure column board
  static async ensureColumnInBoard(columnId, boardId) {
    const result = await query(
      "SELECT id FROM columns WHERE id = $1 AND board_id = $2",
      [columnId, boardId],
    );

    return result.rows[0];
  }

  // Moved task
  static async moveTask(tasksId, boardId, column_id, position) {
    const result = await query(
      `
      UPDATE tasks
        SET column_id = $3, position = $4, updated_at = now()
      WHERE id = $1 AND board_id = $2 RETURNING id`,
      [tasksId, boardId, column_id, position],
    );

    return result.rows[0];
  }

  //List task
  static async listTask(boardId, priority, assignee, column, q) {
    const filters = ["t.board_id = $1"];
    const params = [boardId];

    if (priority) {
      params.push(priority);
      filters.push(`t.priority = $${params.length}`);
    }

    if (assignee) {
      params.push(assignee);
      filters.push(`t.assigned_id = $${params.length}`);
    }
    if (column) {
      params.push(column);
      filters.push(`t.column_id = $${params.length}`);
    }
    if (q) {
      params.push(`%${q}%`);
      filters.push(
        `(t.title ILIKE $${params.length} OR t.description ILIKE $${params.length})`,
      );
    }

    const result = await query(
      `SELECT t.*,
                a.name AS assignee_name,
                a.email AS assignee_email,
                a.avatar_url AS assignee_avatar
         FROM tasks t
         LEFT JOIN users a ON a.id = t.assigned_id
         WHERE ${filters.join(" AND ")}
         ORDER BY t.position ASC`,
      params,
    );

    return result.rows;
  }

  // Create task
  static async createTask(
    columnId,
    boardId,
    title,
    description,
    priority,
    due_date,
    assignee_id,
    userId,
  ) {
    const posRes = await query(
      "SELECT COALESCE(MAX(position), 0) + 1000 AS pos FROM tasks WHERE column_id = $1",
      [columnId],
    );

    const result = await query(
      `INSERT INTO tasks (board_id, column_id, title, description, priority, due_date, assigned_id, position, created_by)
       VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9 )
       RETURNING id`,
      [
        boardId,
        columnId,
        title,
        description || null,
        priority,
        due_date || null,
        assignee_id || null,
        posRes.rows[0].pos,
        userId,
      ],
    );

    return result.rows[0];
  }

  // Update task
  static async updateTask(
    taskId,
    boardId,
    title,
    description,
    priority,
    due_date,
    assignee_id,
  ) {
    const result = await query(
      `UPDATE tasks
            SET title        = COALESCE($3, title),
                description  = COALESCE($4, description),
                priority     = COALESCE($5, priority),
                due_date     = COALESCE($6, due_date),
                assigned_id  = $7,
                updated_at   = now()
         WHERE id = $1 AND board_id = $2
         RETURNING id`,
      [
        taskId,
        boardId,
        title ?? null,
        description ?? null,
        priority ?? null,
        due_date ?? null,
        assignee_id === undefined ? null : assignee_id,
      ],
    );

    return result.rows[0];
  }

  //   Get column move id
  static async getColumnIdMove(taskId, boardId) {
    const result = await query(
      "SELECT t.column_id, c.title FROM tasks t JOIN columns c ON c.id = t.column_id WHERE t.id = $1 AND t.board_id = $2",
      [taskId, boardId],
    );

    return result.rows[0];
  }

  //   Update column move
  static async updateColumnMove(taskId, boardId, column_id, position) {
    const result = await query(
      `UPDATE tasks
            SET column_id    = $3,
                position     = $4,
                updated_at   = now()
         WHERE id = $1 AND board_id = $2
         RETURNING id`,
      [taskId, boardId, column_id, position],
    );

    return result.rows[0];
  }

  // Get move column id
  static async getMoveColumnById(columnId) {
    const result = await query("SELECT title FROM columns WHERE id = $1", [
      columnId,
    ]);

    return result.rows[0];
  }

  // Delete task
  static async deleteTask(taskId, boardId) {
    const result = await query(
      "DELETE FROM tasks WHERE id = $1 AND board_id = $2 RETURNING title",
      [taskId, boardId],
    );

    return result.rows[0];
  }
}

export default Task;
