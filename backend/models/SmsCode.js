const db = require('../config/database');

class SmsCode {
    static async create(phone, code, type) {
        const expiredAt = new Date(Date.now() + 5 * 60 * 1000); // 5分钟过期
        const [result] = await db.query(
            'INSERT INTO sms_codes (phone, code, type, expired_at) VALUES (?, ?, ?, ?)',
            [phone, code, type, expiredAt]
        );
        return result.insertId;
    }

    static async verify(phone, code, type) {
        const [rows] = await db.query(
            'SELECT * FROM sms_codes WHERE phone = ? AND code = ? AND type = ? AND expired_at > NOW() ORDER BY created_at DESC LIMIT 1',
            [phone, code, type]
        );
        return rows[0];
    }

    static async delete(phone, type) {
        await db.query(
            'DELETE FROM sms_codes WHERE phone = ? AND type = ?',
            [phone, type]
        );
    }
}

module.exports = SmsCode; 