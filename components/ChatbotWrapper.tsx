'use client';

import { useState, useEffect } from 'react';
import Chatbot from '@/components/Chatbot';

const ChatbotWrapper = () => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Show welcome animation after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasInteracted) {
        // Add a subtle bounce animation to attract attention
        const button = document.querySelector('[aria-label="Open AI Assistant"]');
        if (button) {
          button.classList.add('animate-bounce');
          setTimeout(() => {
            button.classList.remove('animate-bounce');
          }, 2000);
        }
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [hasInteracted]);

  const handleToggle = () => {
    setIsChatbotOpen(!isChatbotOpen);
    setHasInteracted(true);
  };

  return (
    <>
      <Chatbot 
        isOpen={isChatbotOpen} 
        onToggle={handleToggle} 
      />
      
      {/* Add custom styles for animations */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </>
  );
};

export default ChatbotWrapper;
