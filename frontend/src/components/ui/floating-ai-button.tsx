import React, { useState } from 'react';
import { ChatCircleDots, Robot, X, Sparkle } from '@phosphor-icons/react';
import { AiService } from '../../services/ai.service';
import { ChatMessages, ChatMessage } from './chat-messages';

export const FloatingAIButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const initialMessages: ChatMessage[] = [
    {
      id: 'welcome-1',
      sender: 'assistant',
      content: 'Hi! I am your SpringSight Log Assistant. Ask me about exceptions, stack traces, Spring Boot, databases, or DevOps setup.'
    }
  ];

  const handleSendMessage = async (message: string) => {
    try {
      const response = await AiService.askAssistant(message);
      return response;
    } catch (err) {
      throw new Error('An error occurred while getting the response.');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 md:w-96 h-[500px]">
          <ChatMessages
            messages={initialMessages}
            autoPlay={false}
            showReplay={false}
            interactive={true}
            onSendMessage={handleSendMessage}
            onClose={() => setIsOpen(false)}
            className="w-full h-full border-[#1e293b]"
          />
        </div>
      )}

      {/* Floating Button - Purple Sparkle Minimal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-14 rounded-full bg-[#7c3aed] hover:bg-[#6d28d9] flex items-center justify-center cursor-pointer z-50 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" weight="bold" />
        ) : (
          <Sparkle className="h-6 w-6 text-white" weight="fill" />
        )}
      </button>
    </div>
  );
};
