'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ChatbotContextType {
  isChatbotOpen: boolean;
  openChatbot: () => void;
  closeChatbot: () => void;
  toggleChatbot: () => void;
  setInputMessage: (message: string) => void;
  inputMessage: string;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

export const useChatbot = () => {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error('useChatbot must be used within a ChatbotProvider');
  }
  return context;
};

interface ChatbotProviderProps {
  children: ReactNode;
}

export function ChatbotProvider({ children }: ChatbotProviderProps) {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');

  const openChatbot = () => setIsChatbotOpen(true);
  const closeChatbot = () => setIsChatbotOpen(false);
  const toggleChatbot = () => setIsChatbotOpen(!isChatbotOpen);

  return (
    <ChatbotContext.Provider
      value={{
        isChatbotOpen,
        openChatbot,
        closeChatbot,
        toggleChatbot,
        setInputMessage,
        inputMessage,
      }}
    >
      {children}
    </ChatbotContext.Provider>
  );
}