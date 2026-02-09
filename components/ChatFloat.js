'use client';
import { useState, useRef, useEffect } from 'react';

export default function ChatFloat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('https://ecalc.artgrup.workers.dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg].slice(-5) }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiResponse = { role: 'assistant', content: '' };
      setMessages(prev => [...prev, aiResponse]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        aiResponse.content += chunk;
        setMessages(prev => [...prev.slice(0, -1), { ...aiResponse }]);
      }
    } catch (err) {
      console.error('Eroare chat:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {isOpen ? (
        <div className="bg-white w-80 h-[450px] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
          <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
            <span className="font-bold tracking-tight">Asistent Fiscal eCalc</span>
            <button onClick={() => setIsOpen(false)} className="hover:bg-blue-700 p-1 rounded font-bold">X</button>
          </div>
          
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 text-slate-800 text-sm">
            {messages.length === 0 && (
              <p className="text-slate-500 italic text-center">Salut! Intreaba-ma despre taxe, PFA sau SRL.</p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && <div className="text-xs text-slate-400 animate-pulse">Se incarca raspunsul...</div>}
          </div>

          <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-slate-100 flex gap-2">
            <input 
              className="flex-1 border border-slate-200 rounded-full px-4 py-2 outline-none text-slate-900 bg-slate-50 focus:bg-white focus:border-blue-500 transition-all"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Scrie aici..."
            />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-full font-bold hover:bg-blue-700">OK</button>
          </form>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white px-6 py-4 rounded-full shadow-xl hover:scale-105 transition-all font-bold flex items-center gap-2"
        >
          <span>CHAT FISCAL</span>
        </button>
      )}
    </div>
  );
}
