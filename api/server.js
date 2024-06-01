const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(express.json());

const corsOptions = {
    origin: 'https://linebot-fullstack.vercel.app',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};
app.use(cors(corsOptions));

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const PORT = process.env.PORT || 8000;

const LINE_BOT_API = 'https://api.line.me/v2/bot';
const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
};

app.post('/api/register', async (req, res) => {
    const { student_id, student_name, grade_level, password } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO users (student_id, student_name, grade_level, password) VALUES ($1, $2, $3, $4) RETURNING *',
            [student_id, student_name, grade_level, password]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/login', async (req, res) => {
    const { student_id, password } = req.body;

    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE student_id = $1 AND password = $2',
            [student_id, password]
        );

        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/send-message', async (req, res) => {
    try {
        const { userId, message } = req.body;
        console.log(`Sending message to userId: ${userId}`);
        const body = {
            to: userId,
            messages: [
                { type: 'text', text: message }
            ]
        };
        const response = await axios.post(`${LINE_BOT_API}/message/push`, body, { headers });
        console.log('LINE API response', response.data);
        res.json({
            message: 'Send message success',
            responseData: response.data
        });
    } catch (error) {
        console.error('Error sending message', error.response ? error.response.data : error.message);
        res.status(500).json({
            message: 'Send message failed',
            error: error.response ? error.response.data : error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
