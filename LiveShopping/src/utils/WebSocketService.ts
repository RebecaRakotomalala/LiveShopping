import { Platform } from 'react-native';
import { getWebSocketUrl } from './config';

// Configuration du serveur WebSocket
const WS_SERVER_URL = getWebSocketUrl();

export interface WebSocketMessage {
  type: 'streamer' | 'viewer' | 'offer' | 'answer' | 'candidate' | 'newViewer' | 'streamerUnavailable' | 'activeStreamers';
  adminId?: string;
  viewerId?: string;
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  target?: 'streamer' | 'viewer';
  streamers?: string[];
  viewerIP?: string;
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageHandlers: Map<string, ((data: any) => void)[]> = new Map();

  constructor() {
    this.connect();
  }

  private connect() {
    try {
      console.log(`🔌 Tentative de connexion WebSocket à ${WS_SERVER_URL}`);
      this.ws = new WebSocket(WS_SERVER_URL);

      this.ws.onopen = () => {
        console.log('✅ Connexion WebSocket établie');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          console.log('📨 Message reçu:', data.type);
          this.handleMessage(data);
        } catch (error) {
          console.error('❌ Erreur parsing message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('🔌 Connexion WebSocket fermée:', event.code, event.reason);
        this.handleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('❌ Erreur WebSocket:', error);
      };

    } catch (error) {
      console.error('❌ Erreur création WebSocket:', error);
      this.handleReconnect();
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Tentative de reconnexion ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('❌ Nombre maximum de tentatives de reconnexion atteint');
    }
  }

  private handleMessage(data: WebSocketMessage) {
    const handlers = this.messageHandlers.get(data.type);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  public send(message: WebSocketMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('📤 Envoi message:', message.type);
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('⚠️ WebSocket non connecté, message non envoyé:', message.type);
    }
  }

  public onMessage(type: string, handler: (data: any) => void) {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    this.messageHandlers.get(type)!.push(handler);
  }

  public removeMessageHandler(type: string, handler: (data: any) => void) {
    const handlers = this.messageHandlers.get(type);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  public isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Instance singleton
export const webSocketService = new WebSocketService(); 