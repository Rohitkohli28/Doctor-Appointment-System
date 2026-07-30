import { useState, useContext, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Bot, X, Send, User, Sparkles, Mic, MicOff, Download, Copy, Search, ShieldAlert, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AIContext } from '../context/AIContext';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const Markdown = ({ text }) => {
  if (!text) return null;

  // Simple regex-based markdown parser
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/^### (.*$)/gim, '<h4 class="font-extrabold text-sm text-slate-800 dark:text-slate-200 mt-2 mb-1">$1</h4>')
    .replace(/^## (.*$)/gim, '<h3 class="font-extrabold text-base text-slate-900 dark:text-white mt-3 mb-2">$1</h3>')
    .replace(/^# (.*$)/gim, '<h2 class="font-black text-lg text-slate-900 dark:text-white mt-4 mb-2">$1</h2>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-extrabold text-slate-900 dark:text-white">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    .replace(/^\s*[-*+]\s+(.*)$/gim, '<li class="ml-4 list-disc text-slate-700 dark:text-slate-300 my-1">$1</li>')
    .replace(/`(.*?)`/g, '<code class="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-xs text-primary-600 dark:text-primary-400">$1</code>')
    .replace(/\n/g, '<br />');

  return (
    <div 
      className="prose dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed space-y-1"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

const AIAssistant = () => {
  const location = useLocation();
  const authPaths = ['/login', '/doctor/login', '/register', '/forgot-password'];
  const isAuthPage = authPaths.includes(location.pathname) || location.pathname.startsWith('/reset-password/');

  const { messages, isOpen, isLoading, sendMessage, toggleChat } = useContext(AIContext);
  const [inputMsg, setInputMsg] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  if (isAuthPage) {
    return null;
  }

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const downloadConversation = () => {
    const textLog = messages
      .map(m => `${m.role === 'user' ? 'Patient' : 'MediBot'}: ${m.text}`)
      .join('\n\n');
    const blob = new Blob([textLog], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MediBot_Chat_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

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

  useEffect(() => {
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        setInputMsg(prev => prev + (prev ? ' ' : '') + transcript);
      };

      rec.onerror = (e) => {
        console.error('Speech recognition error:', e.error);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleSend = (e) => {
    if (e) e.preventDefault();
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
            className="fixed bottom-6 right-6 w-[95%] md:w-[400px] h-[600px] max-h-[85vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-800 flex flex-col z-50 overflow-hidden transition-colors duration-300"
          >
            {/* Header */}
            <div className="bg-primary-600 p-4 text-white flex justify-between items-center relative overflow-hidden shrink-0">
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
              <div className="flex items-center gap-1 relative z-10">
                <button 
                  onClick={() => setShowSearch(!showSearch)} 
                  className={`p-2 rounded-full transition-colors ${showSearch ? 'bg-white/25 text-white' : 'hover:bg-white/10 text-white/80 hover:text-white'}`}
                  title="Search message history"
                >
                  <Search className="w-4.5 h-4.5" />
                </button>
                {messages.length > 0 && (
                  <button 
                    onClick={downloadConversation} 
                    className="p-2 hover:bg-white/10 text-white/80 hover:text-white rounded-full transition-colors"
                    title="Download conversation log"
                  >
                    <Download className="w-4.5 h-4.5" />
                  </button>
                )}
                <button 
                  onClick={toggleChat} 
                  className="p-2 hover:bg-white/10 text-white/80 hover:text-white rounded-full transition-colors"
                  title="Close assistant"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Search overlay inside AIAssistant */}
            <AnimatePresence>
              {showSearch && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-2 flex items-center gap-2 overflow-hidden shrink-0"
                >
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input 
                    type="text" 
                    placeholder="Search in chat history..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-xs text-slate-800 dark:text-white"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      Clear
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Medical Disclaimer Banner */}
            <div className="bg-amber-50 dark:bg-amber-950/20 border-b border-amber-100 dark:border-amber-900/50 px-4 py-2 flex items-start gap-2 text-[10px] text-amber-800 dark:text-amber-300 font-semibold shrink-0">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
              <span>MediBot is an AI assistant, not a doctor. Consult a medical professional for advice.</span>
            </div>

            {/* Chat Area */}
            <div className="flex-1 p-4 overflow-y-auto bg-slate-50 dark:bg-slate-950 flex flex-col gap-4">
              {searchQuery && messages.filter(m => m.text.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                <div className="text-center text-xs text-slate-400 dark:text-slate-500 py-8">
                  No matching messages found.
                </div>
              )}
              {messages
                .filter(msg => !searchQuery || msg.text.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((msg, index) => (
                  <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'model' && (
                      <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      </div>
                    )}
                    
                    <div className={`px-4 py-3 rounded-2xl max-w-[80%] text-sm relative group ${
                      msg.role === 'user' 
                        ? 'bg-primary-600 text-white rounded-tr-sm shadow-md' 
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm shadow-sm border border-gray-100 dark:border-slate-700'
                    }`}>
                      {msg.role === 'user' ? (
                        <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
                      ) : (
                        <>
                          <Markdown text={msg.text} />
                          <button 
                            onClick={() => handleCopy(msg.text, index)}
                            className="absolute bottom-1 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 dark:text-slate-500 hover:text-primary-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm"
                            title="Copy message to clipboard"
                          >
                            {copiedIndex === index ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </>
                      )}
                    </div>

                    {msg.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      </div>
                    )}
                  </div>
                ))}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                   <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                   </div>
                   <div className="px-4 py-3 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 dark:border-slate-700 flex gap-1 items-center">
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
               <div className="px-4 pb-2 bg-slate-50 dark:bg-slate-950 flex gap-2 overflow-x-auto no-scrollbar">
                  {predefinedPrompts.map((p, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => handlePromptClick(p)}
                      className="whitespace-nowrap px-3 py-1.5 bg-white dark:bg-slate-800 border border-primary-100 dark:border-slate-700 text-primary-600 dark:text-primary-400 text-xs rounded-full hover:bg-primary-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
                    >
                      {p}
                    </button>
                  ))}
               </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 flex flex-col gap-2">
              <form onSubmit={handleSend} className="relative flex items-center gap-2">
                <div className="relative flex-grow">
                  <input 
                    type="text" 
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    placeholder="Ask MediBot..." 
                    className="w-full pl-4 pr-10 py-3 bg-slate-100 dark:bg-slate-800 border-none rounded-full focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                    disabled={isLoading}
                  />
                  {SpeechRecognition && (
                    <button
                      type="button"
                      onClick={toggleListening}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 hover:text-primary-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                      title={isListening ? "Stop listening" : "Start voice input"}
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                  )}
                </div>
                <button 
                  type="submit" 
                  disabled={isLoading || !inputMsg.trim()}
                  className="p-3 bg-primary-600 hover:bg-primary-700 text-white rounded-full transition-colors disabled:opacity-50 disabled:hover:bg-primary-600 flex-shrink-0"
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
