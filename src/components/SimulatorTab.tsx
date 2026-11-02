import React, { useState, useRef, useEffect } from 'react';
import { SimulatorMessage, SessionData } from '../types';
import { 
  Send, 
  Bot, 
  Trash2, 
  CheckCheck, 
  Sparkles, 
  Smartphone,
  Phone,
  Video,
  MoreVertical,
  Zap
} from 'lucide-react';
import { botEngine } from '../services/botEngine';

interface SimulatorTabProps {
  messages: SimulatorMessage[];
  session: SessionData | null;
  onClearMessages: () => void;
}

export const SimulatorTab: React.FC<SimulatorTabProps> = ({
  messages,
  session,
  onClearMessages,
}) => {
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    if (!textToSend) setInputText('');
    setIsTyping(true);

    try {
      await botEngine.handleIncomingMessage(text, 'Kamu (Simulasi)');
    } finally {
      setIsTyping(false);
    }
  };

  const quickCommands = [
    '!ping',
    '!menu',
    '!runtime',
    '!status',
    '!owner',
    '!quote',
  ];

  return (
    <div className="max-w-xl mx-auto space-y-3">
      {/* Quick Pills Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        <span className="text-[11px] text-zinc-400 flex items-center gap-1 shrink-0">
          <Zap className="w-3 h-3 text-emerald-400" />
          Test Cepat:
        </span>
        {quickCommands.map((cmd) => (
          <button
            key={cmd}
            onClick={() => handleSend(cmd)}
            className="px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-zinc-900 hover:bg-emerald-950/60 text-zinc-300 hover:text-emerald-300 border border-zinc-800 hover:border-emerald-700/50 transition-all shrink-0 active:scale-95"
          >
            {cmd}
          </button>
        ))}
        <button
          onClick={onClearMessages}
          className="ml-auto p-1.5 rounded-lg text-zinc-500 hover:text-red-400 transition-colors shrink-0"
          title="Bersihkan obrolan"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* WhatsApp Mockup Phone Screen */}
      <div className="rounded-3xl bg-[#0b141a] border border-zinc-800 shadow-2xl overflow-hidden flex flex-col h-[560px]">
        {/* WhatsApp Chat Header */}
        <div className="px-4 py-3 bg-[#202c33] border-b border-[#2a3942] flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white shadow">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="font-medium text-sm leading-tight text-zinc-100 flex items-center gap-1.5">
                <span>Bot WhatsApp Pribadi</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              </div>
              <div className="text-[11px] text-emerald-400 leading-tight">
                {isTyping ? 'sedang mengetik balasan...' : 'online (memori HP lokal)'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-zinc-400">
            <Phone className="w-4 h-4 cursor-pointer hover:text-white" />
            <Video className="w-4 h-4 cursor-pointer hover:text-white" />
            <MoreVertical className="w-4 h-4 cursor-pointer hover:text-white" />
          </div>
        </div>

        {/* Chat message wallpaper / body */}
        <div 
          className="flex-1 p-4 overflow-y-auto space-y-3"
          style={{
            backgroundImage: `radial-gradient(#182229 1px, transparent 1px)`,
            backgroundSize: '16px 16px',
            backgroundColor: '#0b141a'
          }}
        >
          {/* Security Notice Bubble */}
          <div className="text-center my-2">
            <span className="inline-block px-3 py-1 rounded-lg bg-[#182229] border border-[#222e35] text-[10px] text-zinc-400 max-w-xs shadow">
              🔒 Pesan dan panggilan dienkripsi secara lokal di penyimpanan HP kamu.
            </span>
          </div>

          {messages.length === 0 ? (
            <div className="h-4/5 flex flex-col items-center justify-center text-center p-4">
              <Bot className="w-10 h-10 text-emerald-500/40 mb-2" />
              <p className="text-xs text-zinc-400 font-medium">Uji Coba Respon Bot Langsung</p>
              <p className="text-[11px] text-zinc-500 max-w-xs mt-1">
                Ketik <strong className="text-emerald-400">!menu</strong> atau <strong className="text-emerald-400">!ping</strong> di bawah untuk menguji source code bot kamu.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isBot = msg.sender === 'bot';
              return (
                <div
                  key={msg.id}
                  className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs shadow-md ${
                      isBot
                        ? 'bg-[#202c33] text-zinc-100 rounded-tl-sm border border-[#2a3942]/60'
                        : 'bg-[#005c4b] text-white rounded-tr-sm'
                    }`}
                  >
                    {isBot && (
                      <div className="text-[10px] font-semibold text-emerald-400 mb-0.5">
                        {msg.senderName}
                      </div>
                    )}
                    <div className="whitespace-pre-line leading-relaxed font-sans select-text">
                      {msg.text}
                    </div>
                    <div className="flex items-center justify-end gap-1 text-[10px] text-zinc-400 mt-1">
                      <span>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {!isBot && <CheckCheck className="w-3.5 h-3.5 text-cyan-400" />}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-[#202c33] rounded-2xl px-3.5 py-2 text-xs text-zinc-400 flex items-center gap-1.5 rounded-tl-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Chat Input Bar */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-2.5 bg-[#202c33] border-t border-[#2a3942] flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ketik pesan WhatsApp (contoh: !menu)..."
            className="flex-1 px-4 py-2 rounded-full bg-[#2a3942] text-xs text-white placeholder:text-zinc-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 transition-colors active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
