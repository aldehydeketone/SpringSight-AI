import React, { useState } from 'react';
import { MessageSquare, X, Send, Bot, Terminal } from 'lucide-react';
import { AiService } from '../../services/ai.service';

export const FloatingAIButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    { sender: 'ai', text: 'Hi! I am your SpringSight Log Assistant. Ask me about exceptions, stack traces, Spring Boot, databases, or DevOps setup.' }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    setMessages((prev) => [...prev, { sender: 'user', text: textToSend }]);
    setPrompt('');
    setIsTyping(true);

    try {
      const response = await AiService.askAssistant(textToSend);
      setMessages((prev) => [...prev, { sender: 'ai', text: response }]);
    } catch (err) {
      setMessages((prev) => [...prev, { sender: 'ai', text: 'An error occurred while getting the response.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleShortcut = (topic: string) => {
    handleSend(`Explain ${topic}`);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 md:w-96 h-[500px] bg-[#12121a] border border-[#1e293b] rounded-2xl flex flex-col shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-4 flex items-center justify-between text-white">
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5" />
              <div>
                <h4 className="font-bold text-sm">SpringSight Log Assistant</h4>
                <p className="text-[10px] text-cyan-200">Focused Technical Support</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:text-cyan-200 transition-colors cursor-pointer">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-thin">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-[#1a1a2e] text-[#f1f5f9] border border-[#1e293b] rounded-bl-none whitespace-pre-line'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-[#1a1a2e] text-[#94a3b8] border border-[#1e293b] rounded-xl rounded-bl-none p-3 text-xs flex items-center space-x-1">
                  <span className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>

          {/* Shortcuts */}
          {messages.length === 1 && (
            <div className="p-3 border-t border-[#1e293b]/60 bg-[#161622]/40">
              <span className="text-[10px] text-[#94a3b8] uppercase font-bold tracking-wider mb-2 block">Quick Topics</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'BeanCreationException',
                  'JWT Error',
                  'Hibernate Mappings',
                  'Database Failures',
                ].map((topic) => (
                  <button
                    key={topic}
                    onClick={() => handleShortcut(topic)}
                    className="bg-[#1a1a2e] hover:bg-[#25253b] border border-[#1e293b] text-cyan-400 text-[10px] px-2 py-1 rounded transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Terminal className="h-3 w-3" />
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-[#1e293b] bg-[#161622] flex items-center space-x-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(prompt)}
              placeholder="Ask about Spring exceptions, SQL grammar..."
              className="flex-1 bg-[#0a0a0f] border border-[#1e293b] rounded-lg px-3 py-2 text-xs text-[#f1f5f9] placeholder-[#94a3b8]/50 focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={() => handleSend(prompt)}
              className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg transition-colors cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer border border-cyan-400/20"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Bot className="h-6 w-6" />}
      </button>
    </div>
  );
};
