const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());

// Configure CORS to allow requests from your Vercel domain
app.use(cors({
    origin: 'https://linebot-cmtc.vercel.app' // Replace with your actual Vercel domain
}));

const PORT = 8000;

const LINE_BOT_API = 'https://api.line.me/v2/bot';
const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
};

app.post('/send-message', async (req, res) => {
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
    console.log(`Running at http://localhost:${PORT}`);
});
