const db = require('../config/database');

class User {
    static async findByPhone(phone) {
        const [rows] = await db.query('SELECT * FROM users WHERE phone = ?', [phone]);
        return rows[0];
    }

    static async create(userData) {
        const { phone, password, nickname } = userData;
        const [result] = await db.query(
            'INSERT INTO users (phone, password, nickname) VALUES (?, ?, ?)',
            [phone, password, nickname]
        );
        return result.insertId;
    }

    static async updateLastLogin(userId) {
        await db.query(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
            [userId]
        );
    }
}

module.exports = User; 