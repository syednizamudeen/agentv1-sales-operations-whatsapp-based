import express from "express";
import { ChatOllama } from "@langchain/ollama";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import pkg from 'pg';
const { Client } = pkg;

const app = express();
app.use(express.json({ limit: '20mb' })); // Support larger image payloads

// 1. Setup Postgres Connection
const db = new Client({
    connectionString: process.env.DB_HOST,
});

const connectWithRetry = () => {
  console.log('🔄 Attempting to connect to DB...');
  db.connect()
    .then(() => console.log("✅ Connected to Postgres"))
    .catch(err => {
      console.error("❌ DB Connection Error. Retrying in 5 seconds...", err.message);
      setTimeout(connectWithRetry, 5000); // Wait 5 seconds before retrying
    });
};

connectWithRetry();

// 2. Initialize Gemma 3 via Ollama
const visionModel = new ChatOllama({
    baseUrl: "http://ollama:11434",
    model: "gemma3:4b", // Multimodal support
    temperature: 0,
});

// 3. Webhook for WhatsApp / Testing
app.post("/webhook", async (req, res) => {
    try {
        const { message, imageBase64, guestName, chatId } = req.body;
        console.log(`📩 Received message from ${guestName || 'Guest'} (chatId: ${chatId || 'N/A'})`);

        // A. Data Retrieval Logic (Linear Integration)
        let orderContext = "No specific order data found.";
        if (guestName) {
            const dbRes = await db.query(
                "SELECT item_purchased, status FROM orders WHERE guest_name ILIKE $1", 
                [`%${guestName}%`]
            );
            if (dbRes.rows.length > 0) {
                orderContext = `Order Found: ${dbRes.rows[0].item_purchased} (Status: ${dbRes.rows[0].status})`;
            }
        }

        // B. Retrieve and trim chat history for this chat (unique by chatId)
        let chatHistory = [];
        if (chatId) {
            const historyRes = await db.query(
                `SELECT message, response FROM chat_history WHERE chat_id = $1 ORDER BY created_at ASC LIMIT 50`,
                [chatId]
            );
            // Convert to message objects
            let allHistory = historyRes.rows.map(row => [
                new HumanMessage(row.message),
                new SystemMessage(row.response)
            ]).flat();

            // Simple token estimation: 1 token ≈ 4 chars (very rough)
            const TOKEN_LIMIT = 3000;
            let tokenCount = 0;
            // Start from the end (most recent), add until limit
            for (let i = allHistory.length - 1; i >= 0; i--) {
                const msg = allHistory[i];
                const msgText = msg.text || (msg.content && msg.content.text) || JSON.stringify(msg.content || msg);
                tokenCount += Math.ceil((msgText || '').length / 4);
                if (tokenCount > TOKEN_LIMIT) break;
                chatHistory.unshift(msg); // Add to start to preserve order
            }
        }

        // C. Prepare Multimodal Content (current message)
        const content = [{ type: "text", text: message }];
        if (imageBase64) {
            content.push({
                type: "image_url",
                image_url: { url: `data:image/jpeg;base64,${imageBase64}` }
            });
        }

        // D. Build prompt sequence: system, history, current
        const promptSequence = [
            new SystemMessage(`You are a helpful and factual assistant for a store.\n RULES: \n1. ONLY use the 'Order Context' provided below. \n2. If a piece of information (like an Order Number) is NOT in the context, state that it is not available. \n3. NEVER invent numbers, dates, or status details. \nCurrent Customer Order Context: ${orderContext}. \nRespond politely and human-like. If an image is provided, analyze it to help the user.`),
            ...chatHistory,
            new HumanMessage({ content })
        ];

        // E. Invoke Gemma 3 with Context
        const response = await visionModel.invoke(promptSequence);

        // F. Store this interaction in chat_history (by chatId)
        if (chatId) {
            await db.query(
                `INSERT INTO chat_history (chat_id, guest_name, message, response) VALUES ($1, $2, $3, $4)`,
                [chatId, guestName, message, response.content]
            );
        }

        console.log("🤖 AI Response:", response.content);
        res.status(200).json({ reply: response.content });

    } catch (error) {
        console.error("Error processing request:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});

app.listen(3000, () => console.log("🚀 Server running on port 3000"));