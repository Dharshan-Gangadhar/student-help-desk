"use client";
import { useState, useRef, useEffect } from 'react';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'bot', text: 'Hello! Ask me anything about academic policies, fees, or hostel rules.' }
  ]);
  const [input, setInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setStatusMsg('Processing document...');
    const formData = new FormData();
    formData.append('document', file);

    try {
      const res = await fetch('https://student-help-desk-backend.onrender.com/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMsg(`Success! Processed ${data.chunksProcessed} knowledge chunks.`);
        setFile(null);
      } else {
        setStatusMsg(`Upload failed: ${data.error}`);
      }
    } catch (err) {
      setStatusMsg('Error connecting to backend.');
    } finally {
      setUploading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userQuery = input.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userQuery }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('https://student-help-desk-backend.onrender.com/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userQuery }),
      });
      const data = await res.json();
      
      setMessages((prev) => [...prev, { sender: 'bot', text: data.answer || 'No response received.' }]);
    } catch (err) {
      setMessages((prev) => [...prev, { sender: 'bot', text: 'Error: Could not reach the server.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col md:flex-row h-screen bg-gray-50 text-gray-800 font-sans">
      
      {/* Sidebar: Knowledge Ingestion */}
      <section className="w-full md:w-80 bg-white border-b md:border-b-0 md:border-r border-gray-200 p-6 flex flex-col justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Campus Helpdesk MVP</h1>
          <p className="text-xs text-gray-500 mt-1">RAG-powered student assistant</p>
          
          <div className="mt-8">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Knowledge Base</h2>
            <form onSubmit={handleFileUpload} className="mt-3 space-y-3">
              <label className="block">
                <span className="sr-only">Choose PDF</span>
                <input 
                  type="file" 
                  accept=".pdf, .txt"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
                />
              </label>
              <button
                type="submit"
                disabled={!file || uploading}
                className="w-full py-2 px-4 bg-gray-900 hover:bg-gray-800 text-white font-medium text-sm rounded-md transition disabled:opacity-50"
              >
                {uploading ? 'Ingesting...' : 'Upload & Train'}
              </button>
            </form>
            {statusMsg && (
              <p className="mt-3 text-xs p-2 bg-gray-100 rounded border border-gray-200 text-gray-600 break-words">
                {statusMsg}
              </p>
            )}
          </div>
        </div>

        <div className="hidden md:block text-xs text-gray-400">
          Your campus, decoded. Ask anything, anytime. 
        </div>
      </section>

      {/* Main Content: Chat Interface */}
      <section className="flex-1 flex flex-col h-full bg-gray-50">
        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-xl p-4 rounded-lg text-sm leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-gray-900 text-white rounded-br-none shadow-sm' 
                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 text-gray-400 text-sm p-4 rounded-lg rounded-bl-none animate-pulse">
                Thinking...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-gray-200">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about exam rules, fine amounts, hostel curfews..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
              suppressHydrationWarning={true}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium text-sm rounded-md transition disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      </section>

    </main>
  );
}