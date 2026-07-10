import bcrypt from "bcryptjs";
import db from "../config/db.js";

class User {
  // Create User
  static async createUser({ name, email, password }) {
    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await db.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name, email, hashedPassword],
    );

    return result.rows[0];
  }

  // Find User by Email
  static async findUserByEmail(email) {
    const result = await db.query(
      "SELECT id, name, email, password FROM users WHERE email = $1",
      [email],
    );
    return result.rows[0];
  }

  //   Find User by id
  static async findUserById(id) {
    const result = await db.query(
      "SELECT id, name, email FROM users WHERE id = $1",
      [id],
    );
    return result.rows[0];
  }
}

export default User;
