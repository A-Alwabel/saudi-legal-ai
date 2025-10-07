// WebSocket Service for Real-time Updates
// Saudi Legal AI v2.0

import { io, Socket } from 'socket.io-client';

// WebSocket Configuration
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5000';

// Event Types
export enum WSEventType {
  // Connection Events
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  ERROR = 'error',
  RECONNECT = 'reconnect',
  
  // Notification Events
  NOTIFICATION = 'notification',
  REMINDER = 'reminder',
  ALERT = 'alert',
  
  // Case Events
  CASE_UPDATE = 'case:update',
  CASE_NEW_DOCUMENT = 'case:new_document',
  CASE_STATUS_CHANGE = 'case:status_change',
  CASE_HEARING = 'case:hearing',
  
  // Client Events
  CLIENT_MESSAGE = 'client:message',
  CLIENT_DOCUMENT = 'client:document',
  CLIENT_PORTAL_ACTIVITY = 'client:portal_activity',
  
  // Financial Events
  PAYMENT_RECEIVED = 'payment:received',
  INVOICE_CREATED = 'invoice:created',
  INVOICE_OVERDUE = 'invoice:overdue',
  
  // Team Events
  TEAM_MESSAGE = 'team:message',
  TASK_ASSIGNED = 'task:assigned',
  TASK_COMPLETED = 'task:completed',
  USER_STATUS = 'user:status',
  
  // AI Events
  AI_RESPONSE = 'ai:response',
  AI_ANALYSIS_COMPLETE = 'ai:analysis_complete',
  AI_DOCUMENT_READY = 'ai:document_ready',
  
  // System Events
  SYSTEM_MAINTENANCE = 'system:maintenance',
  SYSTEM_UPDATE = 'system:update',
  BACKUP_COMPLETE = 'backup:complete',
}

// WebSocket Message Interface
export interface WSMessage<T = any> {
  type: WSEventType;
  data: T;
  timestamp: Date;
  userId?: string;
  firmId?: string;
  metadata?: Record<string, any>;
}

// Notification Interface
export interface WSNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  relatedTo?: {
    type: string;
    id: string;
    name?: string;
  };
  actionRequired?: boolean;
  actions?: Array<{
    label: string;
    action: string;
    primary?: boolean;
  }>;
  createdAt: Date;
}

// WebSocket Service Class
class WebSocketService {
  private socket: Socket | null = null;
  private listeners: Map<WSEventType, Set<Function>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnected = false;
  private userId: string | null = null;
  private firmId: string | null = null;

  constructor() {
    // Initialize event listeners map
    Object.values(WSEventType).forEach(eventType => {
      this.listeners.set(eventType as WSEventType, new Set());
    });
  }

  // Connect to WebSocket server
  connect(userId: string, firmId: string, token?: string): void {
    if (this.socket?.connected) {
      console.log('WebSocket already connected');
      return;
    }

    this.userId = userId;
    this.firmId = firmId;

    // Create socket connection with auth
    this.socket = io(WS_URL, {
      auth: {
        token: token || localStorage.getItem('authToken'),
        userId,
        firmId,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: this.reconnectDelay,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.setupSocketListeners();
  }

  // Setup socket event listeners
  private setupSocketListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log('WebSocket connected');
      this.emit(WSEventType.CONNECT, { connected: true });
      
      // Join user and firm rooms
      if (this.userId) this.joinRoom(`user:${this.userId}`);
      if (this.firmId) this.joinRoom(`firm:${this.firmId}`);
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      console.log('WebSocket disconnected:', reason);
      this.emit(WSEventType.DISCONNECT, { reason });
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.emit(WSEventType.ERROR, { error });
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('WebSocket reconnected after', attemptNumber, 'attempts');
      this.emit(WSEventType.RECONNECT, { attemptNumber });
    });

    // Application events
    Object.values(WSEventType).forEach(eventType => {
      if (!['connect', 'disconnect', 'error', 'reconnect'].includes(eventType)) {
        this.socket?.on(eventType, (data: any) => {
          this.handleMessage({
            type: eventType as WSEventType,
            data,
            timestamp: new Date(),
          });
        });
      }
    });
  }

  // Handle incoming messages
  private handleMessage(message: WSMessage): void {
    const listeners = this.listeners.get(message.type);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(message.data, message);
        } catch (error) {
          console.error(`Error handling ${message.type} event:`, error);
        }
      });
    }
  }

  // Emit event to listeners
  private emit(type: WSEventType, data: any): void {
    this.handleMessage({
      type,
      data,
      timestamp: new Date(),
    });
  }

  // Subscribe to events
  on(eventType: WSEventType, callback: Function): () => void {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.add(callback);
    }

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(eventType);
      if (listeners) {
        listeners.delete(callback);
      }
    };
  }

  // Unsubscribe from events
  off(eventType: WSEventType, callback: Function): void {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  // Send message to server
  send(eventType: string, data: any, callback?: Function): void {
    if (!this.socket?.connected) {
      console.error('WebSocket not connected');
      return;
    }

    if (callback) {
      this.socket.emit(eventType, data, callback);
    } else {
      this.socket.emit(eventType, data);
    }
  }

  // Join a room
  joinRoom(room: string): void {
    this.send('join:room', { room });
  }

  // Leave a room
  leaveRoom(room: string): void {
    this.send('leave:room', { room });
  }

  // Request notification permission
  requestNotificationPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      return Notification.requestPermission();
    }
    return Promise.resolve('denied' as NotificationPermission);
  }

  // Show browser notification
  showBrowserNotification(notification: WSNotification): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotif = new Notification(notification.title, {
        body: notification.message,
        icon: '/logo.png',
        badge: '/badge.png',
        tag: notification.id,
        requireInteraction: notification.actionRequired,
      });

      browserNotif.onclick = () => {
        window.focus();
        // Handle notification click
        if (notification.relatedTo) {
          // Navigate to related entity
          window.location.href = `/${notification.relatedTo.type}/${notification.relatedTo.id}`;
        }
      };
    }
  }

  // Disconnect from server
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Get connection status
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // Get socket instance
  getSocket(): Socket | null {
    return this.socket;
  }

  // Specific event handlers for common use cases

  // Subscribe to case updates
  onCaseUpdate(caseId: string, callback: Function): () => void {
    this.joinRoom(`case:${caseId}`);
    const unsubscribe = this.on(WSEventType.CASE_UPDATE, (data) => {
      if (data.caseId === caseId) {
        callback(data);
      }
    });
    
    return () => {
      this.leaveRoom(`case:${caseId}`);
      unsubscribe();
    };
  }

  // Subscribe to client portal activity
  onClientActivity(clientId: string, callback: Function): () => void {
    this.joinRoom(`client:${clientId}`);
    return this.on(WSEventType.CLIENT_PORTAL_ACTIVITY, (data) => {
      if (data.clientId === clientId) {
        callback(data);
      }
    });
  }

  // Subscribe to payment notifications
  onPaymentReceived(callback: Function): () => void {
    return this.on(WSEventType.PAYMENT_RECEIVED, callback);
  }

  // Subscribe to task assignments
  onTaskAssigned(callback: Function): () => void {
    return this.on(WSEventType.TASK_ASSIGNED, callback);
  }

  // Subscribe to AI responses
  onAIResponse(callback: Function): () => void {
    return this.on(WSEventType.AI_RESPONSE, callback);
  }

  // Subscribe to general notifications
  onNotification(callback: (notification: WSNotification) => void): () => void {
    return this.on(WSEventType.NOTIFICATION, (data) => {
      const notification = data as WSNotification;
      
      // Show browser notification if enabled
      if (Notification.permission === 'granted') {
        this.showBrowserNotification(notification);
      }
      
      callback(notification);
    });
  }

  // Subscribe to reminders
  onReminder(callback: Function): () => void {
    return this.on(WSEventType.REMINDER, callback);
  }

  // Send typing indicator
  sendTypingIndicator(room: string, isTyping: boolean): void {
    this.send('typing', { room, isTyping });
  }

  // Send read receipt
  sendReadReceipt(messageId: string): void {
    this.send('read:receipt', { messageId });
  }
}

// Create singleton instance
const wsService = new WebSocketService();

// Export service instance
export default wsService;

// React Hook for WebSocket
import { useEffect, useCallback, useState } from 'react';

export function useWebSocket(
  eventType: WSEventType,
  callback: Function,
  deps: any[] = []
): void {
  const memoizedCallback = useCallback(callback, deps);

  useEffect(() => {
    const unsubscribe = wsService.on(eventType, memoizedCallback);
    return unsubscribe;
  }, [eventType, memoizedCallback]);
}

// React Hook for notifications
export function useNotifications(
  onNotification: (notification: WSNotification) => void
): void {
  useEffect(() => {
    // Request notification permission on mount
    wsService.requestNotificationPermission();

    // Subscribe to notifications
    const unsubscribe = wsService.onNotification(onNotification);
    
    return unsubscribe;
  }, [onNotification]);
}

// React Hook for connection status
export function useWebSocketConnection(): boolean {
  const [isConnected, setIsConnected] = useState(wsService.getConnectionStatus());

  useEffect(() => {
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    const unsubConnect = wsService.on(WSEventType.CONNECT, handleConnect);
    const unsubDisconnect = wsService.on(WSEventType.DISCONNECT, handleDisconnect);

    return () => {
      unsubConnect();
      unsubDisconnect();
    };
  }, []);

  return isConnected;
}
