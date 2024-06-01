const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const PORT = process.env.PORT || 8000;

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

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
