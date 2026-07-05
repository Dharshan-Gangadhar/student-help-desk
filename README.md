# 🎓 Smart Campus Helpdesk MVP

A full-stack, Retrieval-Augmented Generation (RAG) AI application designed to act as a 24/7 intelligent assistant for university students. The system allows administrators to upload custom knowledge bases (like student handbooks or policy PDFs) and provides a conversational interface for students to ask questions about academic policies, fees, hostel rules, and more.

## ✨ Features

* **Custom Knowledge Ingestion:** Upload PDF and TXT documents directly through the UI to train the AI on institution-specific data.
* **RAG Architecture:** Automatically parses documents, splits text into optimal knowledge chunks, and uses them as semantic context for the AI.
* **Powered by Gemini:** Integrates Google's Gemini API for highly accurate, natural-sounding conversational responses.
* **Modern UI/UX:** Built with Next.js and Tailwind CSS for a responsive, clean, and accessible user interface.
* **Production-Ready Security:** Implements CORS origin restriction and IP rate limiting (100 requests per 15 minutes) to protect the backend infrastructure.
* **Fully Containerized:** Dockerized ecosystem for seamless local development and cloud deployment.

---

## 🛠️ Tech Stack

**Frontend:**
* Next.js (React Framework)
* TypeScript
* Tailwind CSS (Styling)

**Backend:**
* Node.js & Express.js
* Google Generative AI SDK (Gemini)
* PDF-Parse (Document extraction)
* Multer (File handling)
* Express Rate Limit & CORS (Security)

**Infrastructure:**
* Docker & Docker Compose
* Render (Cloud Hosting)

---

## 📂 Project Structure

This is a monorepo containing both the frontend and backend services.

```text
student-help-desk/
├── backend/                # Node.js/Express server logic
│   ├── routes/             # API endpoints (chat, upload)
│   ├── server.js           # Entry point and middleware setup
│   ├── Dockerfile          # Backend container configuration
│   └── package.json        
├── frontend/               # Next.js user interface
│   ├── app/                # React components and pages
│   ├── Dockerfile          # Frontend container configuration
│   └── package.json        
└── docker-compose.yml      # Orchestrates local multi-container setup
```

# You can watch it live:
```
https://student-help-desk-frontend.onrender.com
```
