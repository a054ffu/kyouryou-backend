const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const { logHistory, History } = require("./History"); // 修正されたHistoryモジュールをインポート
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // ★ JWTライブラリをインポート

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(
    cors({
        origin: "*",
    })
);
app.use(express.json());

// MongoDB接続
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected successfully"))
    .catch((err) => console.error("MongoDB connection error:", err));

// --- スキーマとモデルの定義 (変更なし) ---
const locationSchema = new mongoose.Schema({
    _id: { type: String },
    bridge: String,
    Inspector: String,
    Tel: String,
    Id: String,
    Name: String,
    Kana: String,
    Road: String,
    address: String,
    Keisiki: String,
    birth: String,
    length: Number,
    width: Number,
    HowUse: String,
    Date: Number,
    Rank: String,
    Date1: Number,
    Rank1: String,
    Date2: Number,
    Rank2: String,
    Date3: Number,
    Rank3: String,
    Date4: Number,
    Rank4: String,
    Date5: Number,
    Rank5: String,
    Date6: Number,
    Rank6: String,
    Date7: Number,
    Rank7: String,
    Date8: Number,
    Rank8: String,
    Date9: Number,
    Rank9: String,
    Date10: Number,
    Rank10: String,
    Date11: Number,
    Rank11: String,
    Date12: Number,
    Rank12: String,
    Date13: Number,
    Rank13: String,
    Date14: Number,
    Rank14: String,
    Date15: Number,
    Rank15: String,
    Date16: Number,
    Rank16: String,
    Date17: Number,
    Rank17: String,
    Date18: Number,
    Rank18: String,
    Date19: Number,
    Rank19: String,
    Date20: Number,
    Rank20: String,
});
const Location = mongoose.model("Location", locationSchema, "chopsticks");
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    nickname: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});
const User = mongoose.model('User', userSchema);


// --- ★ 認証ミドルウェアの作成 ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"形式を想定

    if (token == null) return res.sendStatus(401); // トークンがなければ拒否

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // トークンが無効なら拒否
        req.user = user; // リクエストオブジェクトにユーザー情報を格納
        next();
    });
};

// --- APIエンドポイントの修正 ---

// データを取得するエンドポイント (認証不要)
app.get("/getopendata", async (req, res) => {
    try {
        const data = await Location.find();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: "データ取得に失敗しました" });
    }
});

// データ削除エンドポイント (★認証が必要)
app.delete("/deleteopendata/:_id", authenticateToken, async (req, res) => {
    try {
        const { _id } = req.params;
        const deleteItem = await Location.findById(_id);
        if (!deleteItem) {
            return res.status(404).json({ message: "データがありません" });
        }
        // ★ 誰が削除したかを記録
        await logHistory("DELETE", deleteItem, req.user.id);
        await Location.findByIdAndDelete(_id);
        res.status(200).json({ message: "削除に成功しました", item: deleteItem });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "データ取得に失敗しました" });
    }
});

// データ作成エンドポイント (★認証が必要)
app.post("/postopendata", authenticateToken, async (req, res) => {
    try {
        const existingData = await Location.findById(req.body._id);
        if (existingData) {
            return res.status(409).json({});
        }
        const newData = new Location(req.body);
        const savedData = await newData.save();
        // ★ 誰が作成したかを記録
        await logHistory("POST", savedData, req.user.id);
        res
            .status(201)
            .json({ message: "データの作成に成功しました", item: savedData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "失敗しました" });
    }
});

// データ更新エンドポイント (★認証が必要)
app.put("/putopendata/:_id", authenticateToken, async (req, res) => {
    try {
        const { _id } = req.params;
        const updateData = req.body;

        const existingData = await Location.findById(_id);
        if (!existingData) {
            return res.status(404).json({ message: "データが見つかりません" });
        }
        // ★ 誰が更新したかを記録
        await logHistory("PUT", existingData, req.user.id);

        // ... (既存のデータ更新ロジックは変更なし)
        existingData.Date5 = existingData.Date4;
        existingData.Rank5 = existingData.Rank4;
        existingData.Date4 = existingData.Date3;
        existingData.Rank4 = existingData.Rank3;
        existingData.Date3 = existingData.Date2;
        existingData.Rank3 = existingData.Rank2;
        existingData.Date2 = existingData.Date1;
        existingData.Rank2 = existingData.Rank1;
        existingData.Date1 = existingData.Date;
        existingData.Rank1 = existingData.Rank;
        existingData.Date = updateData.Date;
        existingData.Rank = updateData.Rank;
        Object.keys(updateData).forEach((key) => {
            if (key !== "Date" && key !== "Rank") {
                existingData[key] = updateData[key];
            }
        });

        const updatedData = await existingData.save();
        res
            .status(200)
            .json({ message: "データの更新に成功しました", item: updatedData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "更新に失敗しました" });
    }
});

// ユーザー新規登録エンドポイント (変更なし)
app.post("/api/auth/signup", async (req, res) => {
    try {
        const { username, password, nickname } = req.body;
        if (!username || !password || !nickname) {
            return res.status(400).json({ message: "ユーザー名、ニックネーム、パスワードは必須です。" });
        }
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({ message: "このユーザー名は既に使用されています。" });
        }
        const newUser = new User({ username, nickname, password });
        await newUser.save();
        res.status(201).json({ message: "ユーザー登録が成功しました。", userId: newUser._id });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ message: "サーバーエラーが発生しました。" });
    }
});

// ユーザーログインエンドポイント (★JWTを返すように変更)
app.post("/api/auth/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: "ユーザー名とパスワードは必須です。" });
        }
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: "ユーザー名またはパスワードが正しくありません。" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "ユーザー名またはパスワードが正しくありません。" });
        }

        // ★ JWTトークンを生成
        const accessToken = jwt.sign(
            { id: user._id, username: user.username, nickname: user.nickname },
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // トークンの有効期限
        );

        res.status(200).json({
            message: "ログインに成功しました。",
            user: {
                id: user._id,
                username: user.username,
                nickname: user.nickname,
            },
            token: accessToken, // ★ トークンをレスポンスに含める
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "サーバーエラーが発生しました。" });
    }
});

// Historyデータを取得するエンドポイント (★ユーザー情報を付加)
app.get("/gethistory", async (req, res) => {
    try {
        // ★ .populate()を使って、userフィールドに紐づくUserドキュメントのusernameを取得
        const historyData = await History.find()
            .sort({ timestamp: -1 }) // 最新順に取得
            .populate('user', 'username'); // 'user'フィールドを参照し、'username'のみ取得

        res.json(historyData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "履歴の取得に失敗しました" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});