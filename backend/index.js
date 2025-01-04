import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 3001;

// 特定のフロントURLのみ許可する
app.use(
    cors({
        origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    })
);

// データベースのセットアップ
const db = new sqlite3.Database(":memory:");

db.serialize(() => {
    db.run("CREATE TABLE users (id INT, name TEXT)");
});

app.use(express.json());

// サーバー存在確認エンドポイント
app.post("/check-server", (req, res) => {
    const { key: KEY } = req.body;
    console.log("KEY", KEY, "PASSKEY", process.env.PASSKEY);
    if (KEY && KEY === process.env.PASSKEY) {
        res.send({ status: "OK" });
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
