"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, User, Minus, Maximize2 } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { socketService } from '@/lib/socket';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Message {
  _id: string;
  sender: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  content: string;
  createdAt: string;
  type?: 'global' | 'direct';
}

const ChatWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [chatMode, setChatMode] = useState<'global' | 'direct'>('global');
  const [activeRecipient, setActiveRecipient] = useState<{ _id: string, name: string } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [typingUsers, setTypingUsers] = useState<{ [key: string]: string }>({});
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
      setUnreadCount(0);
    }
  }, [isOpen, chatMode, activeRecipient]);

  useEffect(() => {
    const handleOpenChat = () => {
      setIsOpen(true);
      setIsMinimized(false);
      setChatMode('global');
      setActiveRecipient(null);
    };
    
    const handleOpenDirectChat = (e: any) => {
      const recipient = e.detail;
      setIsOpen(true);
      setIsMinimized(false);
      setChatMode('direct');
      setActiveRecipient(recipient);
    };

    window.addEventListener('open-team-chat', handleOpenChat);
    window.addEventListener('open-direct-chat', handleOpenDirectChat);
    
    return () => {
      window.removeEventListener('open-team-chat', handleOpenChat);
      window.removeEventListener('open-direct-chat', handleOpenDirectChat);
    };
  }, []);

  useEffect(() => {
    socketService.on('new_message', (message: Message) => {
      if (chatMode === 'global') {
        setMessages(prev => [...prev, message]);
      }
      if (!isOpen || isMinimized || chatMode !== 'global') {
        setUnreadCount(prev => prev + 1);
      }
    });

    socketService.on('new_private_message', (message: Message) => {
      if (chatMode === 'direct' && (message.sender._id === activeRecipient?._id || message.sender._id === user?._id)) {
        setMessages(prev => [...prev, message]);
      }
      if (!isOpen || isMinimized || chatMode !== 'direct') {
        setUnreadCount(prev => prev + 1);
      }
    });

    socketService.on('user_typing', (data: { userId: string, name?: string, typing: boolean, isGlobal: boolean }) => {
      if (data.isGlobal && chatMode === 'global') {
        if (data.typing) {
          setTypingUsers(prev => ({ ...prev, [data.userId]: data.name || 'Someone' }));
        } else {
          setTypingUsers(prev => {
            const next = { ...prev };
            delete next[data.userId];
            return next;
          });
        }
      } else if (!data.isGlobal && chatMode === 'direct' && data.userId === activeRecipient?._id) {
        if (data.typing) {
          setTypingUsers(prev => ({ ...prev, [data.userId]: 'Typing...' }));
        } else {
          setTypingUsers(prev => {
            const next = { ...prev };
            delete next[data.userId];
            return next;
          });
        }
      }
    });

    return () => {
      socketService.off('new_message');
      socketService.off('new_private_message');
      socketService.off('user_typing');
    };
  }, [isOpen, isMinimized, chatMode, activeRecipient]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isMinimized]);

  const fetchMessages = async () => {
    try {
      const url = chatMode === 'global' 
        ? '/chat/global' 
        : `/chat/direct/${activeRecipient?._id}`;
      const response = await api.get(url);
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to fetch messages', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      if (chatMode === 'global') {
        await api.post('/chat/global', { content: newMessage });
      } else {
        await api.post('/chat/direct', { recipientId: activeRecipient?._id, content: newMessage });
      }
      setNewMessage('');
      
      // Stop typing status immediately after sending
      socketService.emit('typing', {
        userId: user?._id,
        recipientId: chatMode === 'direct' ? activeRecipient?._id : null,
        typing: false
      });
    } catch (error) {
      console.error('Failed to send message', error);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    // Emit typing event
    socketService.emit('typing', {
      userId: user?._id,
      name: user?.name,
      recipientId: chatMode === 'direct' ? activeRecipient?._id : null,
      typing: true
    });

    // Clear previous timeout
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    // Set timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      socketService.emit('typing', {
        userId: user?._id,
        recipientId: chatMode === 'direct' ? activeRecipient?._id : null,
        typing: false
      });
    }, 2000);
  };

  const handleOpenAdminChat = async () => {
    try {
      const { data: admins } = await api.get('/users/search?query=admin');
      const mainAdmin = admins.find((a: any) => a.role === 'admin') || admins[0];
      if (mainAdmin) {
        setChatMode('direct');
        setActiveRecipient(mainAdmin);
        setIsMinimized(false);
      } else {
        toast.error('No admin available at the moment');
      }
    } catch (error) {
      toast.error('Failed to connect to admin');
    }
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? '60px' : '500px'
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={cn(
              "glass w-[350px] mb-4 rounded-4xl shadow-2xl overflow-hidden flex flex-col border border-white/10 transition-all duration-300",
              isMinimized && "rounded-full"
            )}
          >
            {/* Header */}
            <div className="p-4 bg-primary text-white flex items-center justify-between cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageSquare size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold">
                    {chatMode === 'global' ? 'Team Chat' : activeRecipient?.name}
                  </h3>
                  <p className="text-[10px] opacity-70">
                    {chatMode === 'global' ? 'Global Discussion' : 'Direct Message'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {chatMode === 'global' && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleOpenAdminChat(); }}
                    className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-[10px] font-black uppercase tracking-tighter mr-2 transition-all active:scale-95 flex items-center gap-1"
                  >
                    <User size={12} />
                    Support
                  </button>
                )}
                {chatMode === 'direct' && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setChatMode('global'); setActiveRecipient(null); }}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-[10px] font-bold"
                  >
                    Global
                  </button>
                )}
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  {isMinimized ? <Maximize2 size={16} /> : <Minus size={16} />}
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Chat Body */}
            {!isMinimized && (
              <>
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-secondary/20"
                >
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-30 text-xs italic">
                      <p>No messages yet. Say hi!</p>
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const isOwn = msg.sender._id === user._id;
                      return (
                        <div key={msg._id || idx} className={cn(
                          "flex flex-col",
                          isOwn ? "items-end" : "items-start"
                        )}>
                          <div className={cn(
                            "flex items-end gap-2 max-w-[80%]",
                            isOwn ? "flex-row-reverse" : "flex-row"
                          )}>
                            <div className="w-6 h-6 rounded-full bg-linear-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[8px] font-bold text-white shrink-0">
                              {msg.sender.name.charAt(0)}
                            </div>
                            <div className={cn(
                              "p-3 rounded-2xl text-xs",
                              isOwn 
                                ? "bg-primary text-white rounded-br-none" 
                                : "glass border border-white/5 text-foreground rounded-bl-none"
                            )}>
                              {!isOwn && chatMode === 'global' && <p className="text-[10px] font-black opacity-50 mb-1">{msg.sender.name}</p>}
                              <p className="leading-relaxed">{msg.content}</p>
                            </div>
                          </div>
                          <span className="text-[9px] text-muted-foreground mt-1 px-8">
                            {format(new Date(msg.createdAt), 'HH:mm')}
                          </span>
                        </div>
                      );
                    })
                  )}
                  {Object.keys(typingUsers).length > 0 && (
                    <div className="flex items-center gap-2 text-[10px] text-primary font-bold italic animate-pulse px-3 py-1 bg-primary/5 rounded-full w-fit ml-2">
                      <div className="flex gap-1">
                        <span className="w-1 h-1 bg-primary rounded-full animate-bounce"></span>
                        <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></span>
                      </div>
                      {Object.values(typingUsers).join(', ')} typing...
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 bg-secondary/30">
                  <div className="relative">
                    <input 
                      type="text"
                      value={newMessage}
                      onChange={handleTyping}
                      placeholder="Type a message..."
                      className="w-full bg-white/5 border border-white/10 rounded-full py-3 px-5 pr-12 text-xs focus:outline-hidden focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                    <button 
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 bg-primary text-white rounded-full hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    >
                      <Send size={14} />
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-2xl relative transition-all duration-300",
          isOpen ? "bg-rose-500 shadow-rose-500/30" : "bg-primary shadow-primary/30"
        )}
      >
        {isOpen ? <X size={20} /> : <MessageSquare size={20} />}
        {unreadCount > 0 && !isOpen && (
          <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-4 border-background animate-bounce">
            {unreadCount}
          </span>
        )}
      </motion.button>
    </div>
  );
};

export default ChatWidget;
