const mongoose = require('mongoose');

// Historyスキーマにユーザー情報を追加
const historySchema = new mongoose.Schema({
    operation: {
        type: String,
        required: true,
        enum: ['POST', 'PUT', 'DELETE'],
    },
    data: {
        type: Object,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    // ★ 変更を行ったユーザーのIDを記録するフィールドを追加
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // 'User'モデルを参照
        required: true,
    },
});

const History = mongoose.model('History', historySchema);

// logHistory関数でユーザーIDを受け取るように変更
const logHistory = async (operation, data, userId) => {
    try {
        const historyEntry = new History({
            operation,
            data,
            user: userId, // 受け取ったユーザーIDを保存
        });
        await historyEntry.save();
        console.log(`History logged for user: ${userId}`);
    } catch (error) {
        console.error('Failed to log history:', error);
    }
};

module.exports = { History, logHistory };
