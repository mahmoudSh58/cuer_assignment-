const express = require("express");
const mysql = require("mysql2/promise");

const app = express();
const PORT = 3000;

/* =========================
   DATABASE CONNECTION
========================= */
async function connectDB() {
    return await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });
}

/* =========================
   HOME PAGE
========================= */
app.get("/", async (req, res) => {
    try {
        const conn = await connectDB();

        const [rows] = await conn.execute("SELECT NOW() AS time");

        await conn.end();

        res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Cuer Assignment</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background: linear-gradient(135deg, #0f172a, #1e293b);
                    color: white;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                }

                .card {
                    text-align: center;
                    padding: 40px;
                    border-radius: 20px;
                    background: rgba(255,255,255,0.08);
                    backdrop-filter: blur(10px);
                    box-shadow: 0 8px 25px rgba(0,0,0,0.3);
                }

                h1 {
                    font-size: 3rem;
                    margin-bottom: 10px;
                    color: #38bdf8;
                }

                h2 {
                    color: #22c55e;
                    margin-bottom: 25px;
                }

                p {
                    font-size: 1.1rem;
                    margin: 8px 0;
                }
            </style>
        </head>
        <body>
            <div class="card">
                <h1>🚀 Cuer Assignment</h1>
                <h2>Node.js Running on AWS ECS</h2>

                <p>✅ Status: Connected to MySQL</p>
                <p>🕒 Database Time: ${rows[0].time}</p>
            </div>
        </body>
        </html>
        `);

    } catch (err) {
        res.status(500).send(`
            <h1>❌ Database Connection Failed</h1>
            <pre>${err.message}</pre>
        `);
    }
});

/* =========================
   HEALTH CHECK (ALB / ECS)
========================= */
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "healthy",
        service: "cuer-assignment"
    });
});

/* =========================
   START SERVER
========================= */
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});