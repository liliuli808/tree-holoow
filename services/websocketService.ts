// WebSocket service - adapted for React Native
// React Native has built-in WebSocket support
import { Message } from './chatService';
import { API_BASE_URL } from '../constants/config';

export interface WebSocketMessage {
    type: 'message' | 'typing' | 'read' | 'online';
    to?: number;
    from?: number;
    content?: string;
    message_id?: number;
    message?: Message;
}

type MessageHandler = (msg: WebSocketMessage) => void;

class WebSocketService {
    private ws: WebSocket | null = null;
    private url: string = '';
    private handlers: MessageHandler[] = [];
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 1000;
    private isConnecting = false;
    private token: string = '';

    // Initialize WebSocket connection
    connect(token: string): void {
        if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
            return;
        }

        this.isConnecting = true;
        this.token = token;

        // Extract host from API_BASE_URL and construct WebSocket URL
        try {
            const apiUrl = new URL(API_BASE_URL);
            const protocol = apiUrl.protocol === 'https:' ? 'wss:' : 'ws:';
            this.url = `${protocol}//${apiUrl.host}/api/v1/ws/chat?token=${token}`;
        } catch (err) {
            console.warn('Invalid API_BASE_URL for WebSocket');
            this.isConnecting = false;
            return;
        }

        try {
            this.ws = new WebSocket(this.url);

            this.ws.onopen = () => {
                console.log('WebSocket connected');
                this.isConnecting = false;
                this.reconnectAttempts = 0;
            };

            this.ws.onmessage = (event) => {
                try {
                    const msg: WebSocketMessage = JSON.parse(event.data);
                    this.handlers.forEach((handler) => handler(msg));
                } catch (err) {
                    // Silently ignore parse errors
                }
            };

            this.ws.onclose = () => {
                console.log('WebSocket disconnected');
                this.isConnecting = false;
                // Only attempt reconnect if not at max attempts
                if (this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.attemptReconnect();
                }
            };

            this.ws.onerror = () => {
                // Silently handle error - onclose will be called after
                this.isConnecting = false;
            };
        } catch (err) {
            console.warn('WebSocket not available');
            this.isConnecting = false;
        }
    }

    // Attempt to reconnect with exponential backoff
    private attemptReconnect(): void {
        if (this.reconnectAttempts >= this.maxReconnectAttempts || !this.token) {
            console.log('Max reconnect attempts reached');
            return;
        }

        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
        this.reconnectAttempts++;

        console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
        setTimeout(() => this.connect(this.token), delay);
    }

    // Disconnect WebSocket
    disconnect(): void {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.handlers = [];
        this.token = '';
        this.reconnectAttempts = this.maxReconnectAttempts;
    }

    // Send a message via WebSocket
    send(msg: WebSocketMessage): boolean {
        if (this.ws?.readyState !== WebSocket.OPEN) {
            console.warn('WebSocket not connected, cannot send message');
            return false;
        }

        try {
            this.ws.send(JSON.stringify(msg));
            return true;
        } catch (err) {
            console.error('Failed to send WebSocket message:', err);
            return false;
        }
    }

    // Send a chat message
    sendMessage(to: number, content: string): boolean {
        return this.send({
            type: 'message',
            to,
            content,
        });
    }

    // Send typing indicator
    sendTyping(to: number): boolean {
        return this.send({
            type: 'typing',
            to,
        });
    }

    // Send read receipt
    sendRead(to: number, messageId: number): boolean {
        return this.send({
            type: 'read',
            to,
            message_id: messageId,
        });
    }

    // Register a message handler
    onMessage(handler: MessageHandler): () => void {
        this.handlers.push(handler);
        return () => {
            this.handlers = this.handlers.filter((h) => h !== handler);
        };
    }

    // Check if connected
    isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN;
    }
}

// Singleton instance
export const websocketService = new WebSocketService();
