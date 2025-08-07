const WebSocket = require('ws');

// Configuration réseau
const SERVER_PORT = 9090;
const SERVER_HOST = '0.0.0.0'; // Écouter sur toutes les interfaces réseau

const wss = new WebSocket.Server({ 
    port: SERVER_PORT,
    host: SERVER_HOST
});

const viewers = new Map(); // viewerId => socket
const streamers = new Set(); // ensemble des streamers

console.log(`🚀 Serveur WebSocket démarré sur ${SERVER_HOST}:${SERVER_PORT}`);
console.log(`📡 Le serveur est accessible depuis l'extérieur sur votre IP locale`);

// Afficher l'IP locale pour faciliter la configuration
const os = require('os');
const networkInterfaces = os.networkInterfaces();
Object.keys(networkInterfaces).forEach(interfaceName => {
    networkInterfaces[interfaceName].forEach(interface => {
        if (interface.family === 'IPv4' && !interface.internal) {
            console.log(`🌐 IP locale détectée: ${interface.address}:${SERVER_PORT}`);
        }
    });
});

wss.on('connection', (ws, req) => {
    const clientIP = req.socket.remoteAddress;
    console.log(`👥 Nouveau client connecté depuis ${clientIP}`);

    ws.on('message', msg => {
        try {
            const data = JSON.parse(msg);
            console.log(`📨 Message de ${clientIP}:`, data.type, data);
            
            // Streamer se connecte
            if (data.type === 'streamer') {
                streamers.add(ws);
                ws.isStreamer = true;
                ws.clientIP = clientIP;
                console.log(`🎥 Streamer connecté depuis ${clientIP} - Total streamers:`, streamers.size);
                
                // Notifier tous les viewers qu'un streamer est disponible
                viewers.forEach((viewerWs, viewerId) => {
                    if (viewerWs.readyState === WebSocket.OPEN) {
                        viewerWs.send(JSON.stringify({
                            type: 'streamerAvailable'
                        }));
                        console.log(`📢 Notification streamer disponible au viewer ${viewerId}`);
                    }
                });
            }
            
            // Viewer se connecte
            else if (data.type === 'viewer') {
                const viewerId = data.viewerId;
                ws.viewerId = viewerId;
                ws.clientIP = clientIP;
                viewers.set(viewerId, ws);
                console.log(`👁️ Viewer connecté: ${viewerId} depuis ${clientIP} - Total viewers:`, viewers.size);
                
                // Notifier tous les streamers qu'un nouveau viewer s'est connecté
                streamers.forEach(streamerWs => {
                    if (streamerWs.readyState === WebSocket.OPEN) {
                        streamerWs.send(JSON.stringify({
                            type: 'newViewer',
                            viewerId: viewerId,
                            viewerIP: clientIP
                        }));
                        console.log(`📡 Nouveau viewer ${viewerId} (${clientIP}) signalé au streamer`);
                    }
                });
            }
            
            // Offer du streamer vers un viewer spécifique
            else if (data.type === 'offer' && data.viewerId) {
                const viewer = viewers.get(data.viewerId);
                if (viewer && viewer.readyState === WebSocket.OPEN) {
                    viewer.send(JSON.stringify({
                        type: 'offer',
                        offer: data.offer,
                        viewerId: data.viewerId
                    }));
                    console.log(`📤 Offer transférée au viewer ${data.viewerId} (${viewer.clientIP})`);
                } else {
                    console.warn(`⚠️ Viewer ${data.viewerId} non trouvé ou déconnecté`);
                }
            }
            
            // Answer du viewer vers le streamer
            else if (data.type === 'answer' && data.viewerId) {
                streamers.forEach(streamerWs => {
                    if (streamerWs.readyState === WebSocket.OPEN) {
                        streamerWs.send(JSON.stringify({
                            type: 'answer',
                            answer: data.answer,
                            viewerId: data.viewerId
                        }));
                        console.log(`📥 Answer du viewer ${data.viewerId} transférée au streamer (${streamerWs.clientIP})`);
                    }
                });
            }
            
            // ICE candidates
            else if (data.type === 'candidate') {
                if (data.target === 'viewer' && data.viewerId) {
                    const viewer = viewers.get(data.viewerId);
                    if (viewer && viewer.readyState === WebSocket.OPEN) {
                        viewer.send(JSON.stringify({
                            type: 'candidate',
                            candidate: data.candidate,
                            viewerId: data.viewerId
                        }));
                        console.log(`🧊 ICE candidate transféré au viewer ${data.viewerId} (${viewer.clientIP})`);
                    }
                } else if (data.target === 'streamer' && data.viewerId) {
                    streamers.forEach(streamerWs => {
                        if (streamerWs.readyState === WebSocket.OPEN) {
                            streamerWs.send(JSON.stringify({
                                type: 'candidate',
                                candidate: data.candidate,
                                viewerId: data.viewerId
                            }));
                            console.log(`🧊 ICE candidate du viewer ${data.viewerId} transféré au streamer (${streamerWs.clientIP})`);
                        }
                    });
                }
            }
        } catch (error) {
            console.error('❌ Erreur lors du parsing du message:', error);
        }
    });

    ws.on('close', () => {
        console.log(`👋 Client déconnecté depuis ${clientIP}`);
        
        if (ws.viewerId) {
            viewers.delete(ws.viewerId);
            console.log(`👁️ Viewer ${ws.viewerId} (${clientIP}) supprimé - Total viewers:`, viewers.size);
        }
        
        if (ws.isStreamer) {
            streamers.delete(ws);
            console.log(`🎥 Streamer (${clientIP}) supprimé - Total streamers:`, streamers.size);
            
            // Notifier tous les viewers que le streamer s'est déconnecté
            viewers.forEach((viewerWs, viewerId) => {
                if (viewerWs.readyState === WebSocket.OPEN) {
                    viewerWs.send(JSON.stringify({
                        type: 'streamerDisconnected'
                    }));
                }
            });
        }
    });

    ws.on('error', (error) => {
        console.error(`❌ Erreur WebSocket depuis ${clientIP}:`, error);
    });
});

// Nettoyage périodique des connexions fermées
setInterval(() => {
    // Nettoyer les viewers déconnectés
    viewers.forEach((ws, viewerId) => {
        if (ws.readyState !== WebSocket.OPEN) {
            viewers.delete(viewerId);
            console.log(`🧹 Viewer ${viewerId} nettoyé`);
        }
    });
    
    // Nettoyer les streamers déconnectés
    const deadStreamers = [];
    streamers.forEach(ws => {
        if (ws.readyState !== WebSocket.OPEN) {
            deadStreamers.push(ws);
        }
    });
    deadStreamers.forEach(ws => {
        streamers.delete(ws);
        console.log('🧹 Streamer nettoyé');
    });
    
    if (viewers.size > 0 || streamers.size > 0) {
        console.log(`📊 État: ${streamers.size} streamer(s), ${viewers.size} viewer(s)`);
    }
}, 30000); // Toutes les 30 secondes

// Gestion propre de l'arrêt du serveur
process.on('SIGINT', () => {
    console.log('\n🛑 Arrêt du serveur WebSocket...');
    wss.close(() => {
        console.log('✅ Serveur fermé proprement');
        process.exit(0);
    });
});