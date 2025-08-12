import { Platform } from 'react-native';
import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  mediaDevices,
  MediaStream,
} from 'react-native-webrtc';
import { webSocketService, WebSocketMessage } from './WebSocketService';
import { WEBRTC_CONFIG, STREAM_CONFIG } from './config';

export interface StreamConfig {
  video: boolean;
  audio: boolean;
  width?: number;
  height?: number;
}

export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private isStreamer = false;
  private adminId: string = '';
  private viewerId: string = '';

  constructor() {
    this.setupWebSocketHandlers();
  }

  private setupWebSocketHandlers() {
    // Gestion des offres (pour les viewers)
    webSocketService.onMessage('offer', async (data: WebSocketMessage) => {
      if (!this.isStreamer && data.offer) {
        await this.handleOffer(data.offer);
      }
    });

    // Gestion des réponses (pour les streamers)
    webSocketService.onMessage('answer', async (data: WebSocketMessage) => {
      if (this.isStreamer && data.answer) {
        await this.handleAnswer(data.answer);
      }
    });

    // Gestion des candidats ICE
    webSocketService.onMessage('candidate', async (data: WebSocketMessage) => {
      if (data.candidate) {
        await this.handleIceCandidate(data.candidate);
      }
    });

    // Notification de nouveau viewer (pour les streamers)
    webSocketService.onMessage('newViewer', (data: WebSocketMessage) => {
      if (this.isStreamer) {
        console.log('👁️ Nouveau viewer connecté:', data.viewerId);
        this.createOffer();
      }
    });
  }

  // Configuration pour streamer
  public async startStreaming(adminId: string, config: StreamConfig = { video: true, audio: true }) {
    try {
      this.isStreamer = true;
      this.adminId = adminId;

      console.log('🎥 Démarrage du streaming...');
      
      // Obtenir le flux média local
      this.localStream = await mediaDevices.getUserMedia({
        audio: config.audio,
        video: config.video ? {
          width: config.width || 1280,
          height: config.height || 720,
          frameRate: 30,
        } : false,
      });

      console.log('✅ Flux local obtenu');

      // Créer la connexion peer
      this.peerConnection = new RTCPeerConnection({
        iceServers: WEBRTC_CONFIG.iceServers,
      });

      // Ajouter le flux local
      this.localStream.getTracks().forEach(track => {
        this.peerConnection?.addTrack(track, this.localStream!);
      });

      // Gestion des candidats ICE
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          webSocketService.send({
            type: 'candidate',
            candidate: event.candidate,
            target: 'viewer',
          });
        }
      };

      // Connexion au serveur de signaling
      webSocketService.send({
        type: 'streamer',
        adminId: this.adminId,
      });

      console.log('✅ Streaming démarré avec succès');
      return this.localStream;

    } catch (error) {
      console.error('❌ Erreur démarrage streaming:', error);
      throw error;
    }
  }

  // Configuration pour viewer
  public async startViewing(viewerId: string, adminId: string) {
    try {
      this.isStreamer = false;
      this.viewerId = viewerId;
      this.adminId = adminId;

      console.log('👁️ Démarrage du viewing...');

      // Créer la connexion peer
      this.peerConnection = new RTCPeerConnection({
        iceServers: WEBRTC_CONFIG.iceServers,
      });

      // Gestion du flux distant
      this.peerConnection.ontrack = (event) => {
        console.log('📺 Flux distant reçu');
        this.remoteStream = event.streams[0];
        // Émettre un événement pour notifier le composant
        this.onRemoteStreamReceived?.(this.remoteStream);
      };

      // Gestion des candidats ICE
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          webSocketService.send({
            type: 'candidate',
            candidate: event.candidate,
            target: 'streamer',
          });
        }
      };

      // Connexion au serveur de signaling
      webSocketService.send({
        type: 'viewer',
        viewerId: this.viewerId,
        adminId: this.adminId,
      });

      console.log('✅ Viewing démarré avec succès');

    } catch (error) {
      console.error('❌ Erreur démarrage viewing:', error);
      throw error;
    }
  }

  private async handleOffer(offer: RTCSessionDescriptionInit) {
    try {
      if (!this.peerConnection) {
        throw new Error('PeerConnection non initialisée');
      }

      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      webSocketService.send({
        type: 'answer',
        answer: answer,
      });

      console.log('✅ Réponse envoyée au streamer');

    } catch (error) {
      console.error('❌ Erreur traitement offre:', error);
    }
  }

  private async handleAnswer(answer: RTCSessionDescriptionInit) {
    try {
      if (!this.peerConnection) {
        throw new Error('PeerConnection non initialisée');
      }

      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      console.log('✅ Réponse du viewer traitée');

    } catch (error) {
      console.error('❌ Erreur traitement réponse:', error);
    }
  }

  private async handleIceCandidate(candidate: RTCIceCandidateInit) {
    try {
      if (!this.peerConnection) {
        throw new Error('PeerConnection non initialisée');
      }

      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      console.log('✅ Candidat ICE ajouté');

    } catch (error) {
      console.error('❌ Erreur ajout candidat ICE:', error);
    }
  }

  private async createOffer() {
    try {
      if (!this.peerConnection) {
        throw new Error('PeerConnection non initialisée');
      }

      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);

      webSocketService.send({
        type: 'offer',
        offer: offer,
      });

      console.log('✅ Offre créée et envoyée');

    } catch (error) {
      console.error('❌ Erreur création offre:', error);
    }
  }

  // Callback pour notifier quand le flux distant est reçu
  public onRemoteStreamReceived?: (stream: MediaStream) => void;

  // Arrêter le streaming/viewing
  public stop() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.remoteStream = null;
    this.isStreamer = false;
    this.adminId = '';
    this.viewerId = '';

    console.log('🛑 Streaming/viewing arrêté');
  }

  // Getters
  public getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  public getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  public isStreaming(): boolean {
    return this.isStreamer;
  }
}

// Instance singleton
export const webRTCService = new WebRTCService(); 