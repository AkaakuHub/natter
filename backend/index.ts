import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from '@prisma/client'

dotenv.config();

const app = express();
const port = 3001;

// 特定のフロントURLのみ許可する
app.use(
    cors({
        origin: ["http://localhost:3000", "http://127.0.0.1:3000", "http://akua-server:3000"],
    })
);

export const prisma = new PrismaClient();

app.use(express.json());

// サーバー存在確認エンドポイント
app.post("/check-server", (req, res) => {
    const { key: KEY } = req.body;
    const now = new Date();
    console.log(`${now.toLocaleString()}: ${KEY}, status=${KEY === process.env.PASSKEY ? "OK" : "NG"}`);
    if (KEY && KEY === process.env.PASSKEY) {
        res.send({ status: "OK" });
    }
});

app.get("/users", async (req, res) => {
    const users = await prisma.user.findMany();
    res.json(users);
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

