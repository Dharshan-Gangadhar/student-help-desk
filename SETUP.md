# 🚀 Smart Campus Helpdesk Documentation

## Getting Started (Local Development)

### Prerequisites
* Node.js (v18+)
* Docker & Docker Compose (Optional, for containerized running)
* A Google Gemini API Key

### 1. Backend Setup
Navigate to the backend directory and install dependencies:
```
bash
cd backend
npm install
```

Create a .env file in the /backend folder and add your API key:
```
GEMINI_API_KEY=your_google_gemini_api_key_here
PORT=5000
```

Start the backend development server:
```
node server.js
```
## 2. Frontend Setup
Open a new terminal, navigate to the frontend directory, and install dependencies:
```
Bash

cd frontend
npm install

Create a .env.local file in the /frontend folder and link your local backend:
```
Code snippet
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```
Start the frontend development server:
```
Bash
npm run dev
Visit http://localhost:3000 in your browser to view the application.
```
# 🐳 Running with Docker
To spin up the entire ecosystem locally using Docker:

Ensure Docker Desktop is running.

Add your .env files to both the /frontend and /backend directories as shown above.

Run the following command from the root directory:
```
Bash
docker-compose up --build
```
# 🌐 API Endpoints
POST /api/upload
Accepts multipart/form-data containing a .pdf or .txt file. Parses the document and updates the internal RAG knowledge chunks.

# POST /api/chat
Accepts a JSON body containing the user's query and returns the AI-generated response based on the ingested context.
Payload:
```
JSON
{
  "query": "What are the hostel curfew timings?"
}
```
# ☁️ Deployment
This project is configured for seamless deployment as two decoupled Web Services on Render.

Backend Service: Connect the repo, set Root Directory to backend, Runtime to Node, and add the GEMINI_API_KEY to Render's environment variables.

Frontend Service: Connect the repo, set Root Directory to frontend, Runtime to Node, and add NEXT_PUBLIC_API_URL pointing to the live backend URL.

Note: Ensure the backend corsOptions in server.js are updated to allow requests strictly from your production frontend URL.

# 🔮 Future Enhancements
Persistent Vector Database: Integrate Pinecone or MongoDB to persist knowledge chunks across server restarts.

Advanced Chunking: Implement Recursive Character Splitting for higher semantic density.

Source Citations: Update the RAG prompt to cite specific document pages when answering.

Authentication: Add NextAuth to restrict uploads to campus administrators only.
