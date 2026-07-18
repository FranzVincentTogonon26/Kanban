import bcrypt from "bcryptjs";
import { query } from "../config/db.js";

class User {
  // Create User
  static async createUser({ name, email, password }) {
    const hashedPassword = await bcrypt.hash(password, 12);

    const {
      rows: [{ count }],
    } = await query("SELECT COUNT(*)::int AS count FROM users");

    const isFirstUser = count === 0;
    const role = isFirstUser ? "admin" : "member";
    const status = isFirstUser ? "active" : "pending";

    const result = await query(
      "INSERT INTO users (name, email, password_hash, role, status ) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, status",
      [name, email, hashedPassword, role, status],
    );

    return result.rows[0];
  }

  // Find User by Email
  static async findUserByEmail(email) {
    const result = await query(
      "SELECT id, name, email, password_hash, avatar_url, role, status FROM users WHERE email = $1",
      [email],
    );
    return result.rows[0];
  }

  //   Find User by id
  static async findUserById(id) {
    const result = await query(
      "SELECT id, name, email, role, status FROM users WHERE id = $1",
      [id],
    );
    return result.rows[0];
  }

  //   User list
  static async usersList() {
    const result = await query(
      "SELECT id, name, email, avatar_url, role, status, created_at FROM users WHERE role <> $1 ORDER BY created_at DESC",
      ["admin"],
    );
    return result.rows;
  }

  // Update User Status
  static async updateStatus(userId, status) {
    const result = await query(
      "UPDATE users SET status = $1 WHERE id = $2 RETURNING id, name",
      [status, userId],
    );
    return result.rows[0];
  }

  // Delete user
  static async deleteUser(userId) {
    const result = await query("DELETE FROM users WHERE id = $1", [userId]);
    return result.rows[0];
  }
}

export default User;
