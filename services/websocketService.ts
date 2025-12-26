import { Message } from './chatService';

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

    // Initialize WebSocket connection
    connect(token: string): void {
        if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
            return;
        }

        this.isConnecting = true;

        // Construct WebSocket URL from current location
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.hostname;
        const port = '8080'; // Backend port
        this.url = `${protocol}//${host}:${port}/api/v1/ws/chat?token=${token}`;

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
                    this.handlers.forEach(handler => handler(msg));
                } catch (err) {
                    console.error('Failed to parse WebSocket message:', err);
                }
            };

            this.ws.onclose = () => {
                console.log('WebSocket disconnected');
                this.isConnecting = false;
                this.attemptReconnect(token);
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.isConnecting = false;
            };
        } catch (err) {
            console.error('Failed to create WebSocket:', err);
            this.isConnecting = false;
        }
    }

    // Attempt to reconnect with exponential backoff
    private attemptReconnect(token: string): void {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('Max reconnect attempts reached');
            return;
        }

        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
        this.reconnectAttempts++;

        console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
        setTimeout(() => this.connect(token), delay);
    }

    // Disconnect WebSocket
    disconnect(): void {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.handlers = [];
        this.reconnectAttempts = this.maxReconnectAttempts; // Prevent auto-reconnect
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
            this.handlers = this.handlers.filter(h => h !== handler);
        };
    }

    // Check if connected
    isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN;
    }
}

// Singleton instance
export const websocketService = new WebSocketService();
