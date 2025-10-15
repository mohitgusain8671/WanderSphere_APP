import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppStore } from '../store';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: Set<string>;
  typingUsers: Map<string, string[]>; // chatId -> userIds
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  onlineUsers: new Set(),
  typingUsers: new Map(),
});

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Map<string, string[]>>(new Map());
  
  const { user, accessToken, addMessage, updateChatLastMessage, markMessageAsRead, markMessageAsDelivered } = useAppStore();

  useEffect(() => {
    if (user && accessToken) {
      initializeSocket();
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [user, accessToken]);

  const initializeSocket = () => {
    const HOST = process.env.EXPO_PUBLIC_API_HOST || 'http://localhost:5000';
    
    const newSocket = io(HOST, {
      auth: {
        token: accessToken
      },
      transports: ['websocket', 'polling']
    });

    // Connection events
    newSocket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    // Message events
    newSocket.on('new_message', (data) => {
      const { message, chatId } = data;
      addMessage(chatId, message);
      
      // Auto-mark as delivered if not from current user
      if (message.sender._id !== user?._id) {
        newSocket.emit('message_delivered', {
          messageId: message._id,
          chatId
        });
      }
    });

    newSocket.on('chat_updated', (data) => {
      const { chatId, lastMessage, lastActivity } = data;
      updateChatLastMessage(chatId, lastMessage, lastActivity);
    });

    newSocket.on('message_read_receipt', (data) => {
      const { messageId, chatId, readBy, readAt } = data;
      markMessageAsRead(messageId, readBy, readAt);
    });

    newSocket.on('message_delivered_receipt', (data) => {
      const { messageId, chatId, deliveredTo, deliveredAt } = data;
      markMessageAsDelivered(messageId, deliveredTo, deliveredAt);
    });

    // Typing events
    newSocket.on('user_typing', (data) => {
      const { userId, chatId, user: typingUser } = data;
      setTypingUsers(prev => {
        const newMap = new Map(prev);
        const chatTypingUsers = newMap.get(chatId) || [];
        if (!chatTypingUsers.includes(userId)) {
          newMap.set(chatId, [...chatTypingUsers, userId]);
        }
        return newMap;
      });
    });

    newSocket.on('user_stop_typing', (data) => {
      const { userId, chatId } = data;
      setTypingUsers(prev => {
        const newMap = new Map(prev);
        const chatTypingUsers = newMap.get(chatId) || [];
        const filteredUsers = chatTypingUsers.filter(id => id !== userId);
        if (filteredUsers.length === 0) {
          newMap.delete(chatId);
        } else {
          newMap.set(chatId, filteredUsers);
        }
        return newMap;
      });
    });

    // User status events
    newSocket.on('user_status_changed', (data) => {
      const { userId, isOnline } = data;
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        if (isOnline) {
          newSet.add(userId);
        } else {
          newSet.delete(userId);
        }
        return newSet;
      });
    });

    // Error handling
    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    setSocket(newSocket);
  };

  const value: SocketContextType = {
    socket,
    isConnected,
    onlineUsers,
    typingUsers,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};