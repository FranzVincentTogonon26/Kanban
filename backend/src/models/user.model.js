import bcrypt from "bcryptjs";
import { query } from "../config/db.js";

class User {
  // Create User
  static async createUser({ name, email, password }) {
    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await query(
      "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name, email, hashedPassword],
    );

    return result.rows[0];
  }

  // Find User by Email
  static async findUserByEmail(email) {
    const result = await query(
      "SELECT id, name, email, password_hash, avatar_url FROM users WHERE email = $1",
      [email],
    );
    return result.rows[0];
  }

  //   Find User by id
  static async findUserById(id) {
    const result = await query(
      "SELECT id, name, email FROM users WHERE id = $1",
      [id],
    );
    return result.rows[0];
  }
}

export default User;
