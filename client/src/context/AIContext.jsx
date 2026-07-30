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
      
      const replyText = response.data?.text || "I am MediBot, your healthcare assistant! You can search for doctors by specialization (e.g., Cardiology, Dermatology) or book an appointment directly under Find Doctors.";
      const aiMessage = { role: 'model', text: replyText };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("AI Error:", error);
      const lower = text.toLowerCase();
      let fallbackText = "I am MediBot, your AI healthcare assistant. You can search for doctors by specialization (Cardiology, Dermatology, Orthopedics, Pediatrics, etc.) or view your upcoming appointments.";
      if (lower.includes('cardiol') || lower.includes('heart')) {
        fallbackText = "I found Cardiology specialists available on MediCare! You can search for Cardiology under 'Find Doctors' to view available slots and book an appointment.";
      } else if (lower.includes('derm') || lower.includes('skin')) {
        fallbackText = "We have top Dermatologists available! You can filter by Dermatology under 'Find Doctors' to schedule a consultation.";
      } else if (lower.includes('appoint') || lower.includes('book')) {
        fallbackText = "To book an appointment: Go to 'Find Doctors' in the patient menu, pick your preferred doctor, select an active time slot, and complete payment!";
      }
      setMessages(prev => [...prev, { role: 'model', text: fallbackText }]);
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
