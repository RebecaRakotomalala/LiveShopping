// Configuration du serveur WebSocket
export const SERVER_CONFIG = {
  // Remplacez par l'IP de votre serveur
  // Pour trouver votre IP : ipconfig (Windows) ou ifconfig (Mac/Linux)
  HOST: __DEV__ ? '192.168.1.100' : 'votre-serveur-production.com',
  PORT: 8080,
  PROTOCOL: __DEV__ ? 'ws' : 'wss',
};

export const getWebSocketUrl = () => {
  return `${SERVER_CONFIG.PROTOCOL}://${SERVER_CONFIG.HOST}:${SERVER_CONFIG.PORT}`;
};

// Configuration WebRTC
export const WEBRTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    // Ajoutez vos serveurs TURN si nécessaire
    // { urls: 'turn:votre-serveur-turn.com:3478', username: 'user', credential: 'pass' },
  ],
};

// Configuration du streaming
export const STREAM_CONFIG = {
  video: {
    width: 1280,
    height: 720,
    frameRate: 30,
  },
  audio: {
    sampleRate: 48000,
    channelCount: 2,
  },
}; 