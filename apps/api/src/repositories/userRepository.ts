import { pool } from "src/db/db";

export const userRepository = {
  async findUserByEmail(email: string) {
    const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
    return result.rows[0] ?? null;
  },

  async findUserById(userId: string) {
    const result = await pool.query(`SELECT * FROM users WHERE user_id = $1`, [userId]);
    return result.rows[0] ?? null;
  },

  async insertUser(data: {
    firstName: string; lastName: string; email: string;
    passwordHash: string; address: string; role: string;
  }) {
    await pool.query(
      `INSERT INTO users (first_name, last_name, email, password, address, role)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [data.firstName, data.lastName, data.email, data.passwordHash, data.address, data.role],
    );
  },

  async updateUserInfo(userId: string, data: {
    firstName: string; lastName: string; email: string; address: string;
  }) {
    await pool.query(
      `UPDATE users SET first_name = $1, last_name = $2, email = $3, address = $4 WHERE user_id = $5`,
      [data.firstName, data.lastName, data.email, data.address, userId],
    );
  },

  async updatePassword(userId: string, passwordHash: string) {
    await pool.query(`UPDATE users SET password = $1 WHERE user_id = $2`, [passwordHash, userId]);
  },
};