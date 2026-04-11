import { useState, useContext, useRef, useEffect } from 'react';
import { Bot, X, Send, User, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AIContext } from '../context/AIContext';

const AIAssistant = () => {
  const { messages, isOpen, isLoading, sendMessage, toggleChat } = useContext(AIContext);
  const [inputMsg, setInputMsg] = useState('');
  const messagesEndRef = useRef(null);

  const predefinedPrompts = [
    "Find cardiologist near me",
    "Cost of MRI scan",
    "My next appointment"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    sendMessage(inputMsg);
    setInputMsg('');
  };

  const handlePromptClick = (text) => {
    sendMessage(text);
  };

  return (
    <>
      <button
        onClick={toggleChat}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-2xl transition-transform duration-300 z-50 ${isOpen ? 'scale-0' : 'scale-100 bg-primary-600 hover:bg-primary-700 animate-pulse-soft text-white'}`}
        aria-label="Open AI Assistant"
      >
        <Bot className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9, transition: { duration: 0.2 } }}
            className="fixed bottom-6 right-6 w-[90%] md:w-[400px] h-[600px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary-600 p-4 text-white flex justify-between items-center relative overflow-hidden">
               <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                   <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold">MediBot</h3>
                  <p className="text-xs text-primary-100 flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI Assistant</p>
                </div>
              </div>
              <button 
                onClick={toggleChat} 
                className="p-2 hover:bg-white/10 rounded-full transition-colors relative z-10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-4">
              {messages.map((msg, index) => (
                <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'model' && (
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-primary-600" />
                    </div>
                  )}
                  
                  <div className={`px-4 py-3 rounded-2xl max-w-[80%] text-sm ${
                    msg.role === 'user' 
                      ? 'bg-primary-600 text-white rounded-tr-sm shadow-md' 
                      : 'bg-white text-gray-800 rounded-tl-sm shadow-sm border border-gray-100'
                  }`}>
                    {/* Basic markdown parsing replacing newlines with br and * with bullets for now */}
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {msg.text.split('\n').map((line, i) => (
                        <span key={i}>
                          {line.startsWith('* ') ? <span className="flex gap-2"><span className="text-primary-500">•</span> {line.replace('* ', '')}</span> : line}
                          <br/>
                        </span>
                      ))}
                    </div>
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-gray-500" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                   <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-primary-600" />
                   </div>
                   <div className="px-4 py-3 bg-white text-gray-800 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 flex gap-1 items-center">
                     <div className="w-2 h-2 rounded-full bg-primary-300 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                     <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                     <div className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                   </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Predefined Prompts */}
            {messages.length <= 2 && (
               <div className="px-4 pb-2 bg-gray-50 flex gap-2 overflow-x-auto no-scrollbar">
                  {predefinedPrompts.map((p, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => handlePromptClick(p)}
                      className="whitespace-nowrap px-3 py-1.5 bg-white border border-primary-100 text-primary-600 text-xs rounded-full hover:bg-primary-50 transition-colors shadow-sm"
                    >
                      {p}
                    </button>
                  ))}
               </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
              <form onSubmit={handleSend} className="relative flex items-center">
                <input 
                  type="text" 
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  placeholder="Ask MediBot..." 
                  className="w-full pl-4 pr-12 py-3 bg-gray-100 border-none rounded-full focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-sm outline-none"
                  disabled={isLoading}
                />
                <button 
                  type="submit" 
                  disabled={isLoading || !inputMsg.trim()}
                  className="absolute right-2 p-2 bg-primary-600 hover:bg-primary-700 text-white rounded-full transition-colors disabled:opacity-50 disabled:hover:bg-primary-600"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAssistant;
