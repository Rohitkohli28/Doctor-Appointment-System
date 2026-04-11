import { createContext, useState } from 'react';
import api from '../utils/api';

export const AIContext = createContext();

export const AIProvider = ({ children }) => {
  const [messages, setMessages] = useState([
    { role: 'model', text: 'Hello! I am MediBot. How can I assist you with your health or appointment queries today?' }
  ]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (text) => {
    // Add User Message
    const userMessage = { role: 'user', text };
    setMessages(prev => [...prev, userMessage]);
    
    setIsLoading(true);

    try {
      const historyForApi = messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
      const response = await api.post('/ai/chat', { message: text, conversationHistory: historyForApi });
      
      const aiMessage = { role: 'model', text: response.data.text };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: 'Sorry, I am facing some issues connecting. Please try again later.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{ role: 'model', text: 'Hello! I am MediBot. How can I assist you with your health or appointment queries today?' }]);
  };

  const toggleChat = () => setIsOpen(prev => !prev);

  return (
    <AIContext.Provider value={{ messages, isOpen, isLoading, sendMessage, clearChat, toggleChat }}>
      {children}
    </AIContext.Provider>
  );
};
