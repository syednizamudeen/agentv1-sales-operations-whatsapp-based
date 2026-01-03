docker compose up --build -d
docker compose down

docker compose down -v && docker compose up -d

Test 1: Simple Text & DB Query
Open Thunder Client -> New Request.

Set Method to POST and URL to http://localhost:3000/webhook.

Go to the Body tab (JSON) and paste:

JSON

{
  "guestName": "John Wick",
  "message": "What is the status of my order?"
}
Expectation: Gemma 3 should respond: "Hi John! Your Gourmet Coffee Bean order has been Shipped."

Test 2: Multimodal (Image) Test
Use a website like Base64 Image Encoder to turn a small JPEG into a string.

Paste it into the JSON:

JSON

{
  "message": "What is this item in the picture?",
  "imageBase64": "/9j/4AAQSkZJRgABAQ..." 
}
Expectation: Gemma 3 will "look" at the image and describe it to you.

┌────────────┐
│ WhatsApp   │
│   User     │
└─────┬──────┘
      │
      ▼
┌─────────────────┐
│ WhatsApp API    │
│ (Webhook)       │
└─────┬───────────┘
      │
      ▼
┌──────────────────────────┐
│ Node.js Backend           │
│                            │
│ - Auth / User lookup       │
│ - Conversation state       │
│ - Intent detection         │
│ - Business rules           │
│                            │
│   ┌───────────────┐        │
│   │ PostgreSQL    │◄────┐  │
│   │ - Orders      │     │  │
│   │ - Products    │     │  │
│   │ - Memory      │     │  │
│   └───────────────┘     │  │
│                          │  │
│   ┌───────────────┐      │  │
│   │ Vector Store  │◄─────┘  │
│   │ (RAG Docs)    │         │
│   └───────────────┘         │
│            │                │
│            ▼                │
│     ┌─────────────┐         │
│     │ LangChain   │         │
│     └──────┬──────┘         │
│            ▼                │
│     ┌─────────────┐         │
│     │ Ollama      │         │
│     └──────┬──────┘         │
│            ▼                │
│     ┌─────────────┐         │
│     │ Gemma 3     │         │
│     └─────────────┘         │
└──────────────────────────┘
