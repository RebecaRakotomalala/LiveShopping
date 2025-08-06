const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 9090 });

const viewers = new Map(); // viewerId => socket
const streamers = new Set(); // ensemble des streamers

console.log('🚀 Serveur WebSocket démarré sur le port 9090');

wss.on('connection', ws => {
    console.log('🙋‍♂️ Nouveau client connecté');

    ws.on('message', msg => {
        try {
            const data = JSON.parse(msg);
            console.log("📩 Message reçu:", data.type, data);

            // Streamer se connecte
            if (data.type === 'streamer') {
                streamers.add(ws);
                ws.isStreamer = true;
                console.log("🎥 Streamer connecté - Total streamers:", streamers.size);
                
                // Notifier tous les viewers qu'un streamer est disponible
                viewers.forEach((viewerWs, viewerId) => {
                    console.log(`📢 Notification du streamer au viewer ${viewerId}`);
                });
            }

            // Viewer se connecte
            else if (data.type === 'viewer') {
                const viewerId = data.viewerId;
                ws.viewerId = viewerId;
                viewers.set(viewerId, ws);
                console.log(`👁️ Viewer connecté: ${viewerId} - Total viewers:`, viewers.size);
                
                // Notifier tous les streamers qu'un nouveau viewer s'est connecté
                streamers.forEach(streamerWs => {
                    if (streamerWs.readyState === WebSocket.OPEN) {
                        streamerWs.send(JSON.stringify({
                            type: 'newViewer',
                            viewerId: viewerId
                        }));
                        console.log(`📡 Nouveau viewer ${viewerId} signalé au streamer`);
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
                    console.log(`📤 Offer transférée au viewer ${data.viewerId}`);
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
                        console.log(`📤 Answer du viewer ${data.viewerId} transférée au streamer`);
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
                        console.log(`🧊 ICE candidate transféré au viewer ${data.viewerId}`);
                    }
                } else if (data.target === 'streamer' && data.viewerId) {
                    streamers.forEach(streamerWs => {
                        if (streamerWs.readyState === WebSocket.OPEN) {
                            streamerWs.send(JSON.stringify({
                                type: 'candidate',
                                candidate: data.candidate,
                                viewerId: data.viewerId
                            }));
                            console.log(`🧊 ICE candidate du viewer ${data.viewerId} transféré au streamer`);
                        }
                    });
                }
            }

        } catch (error) {
            console.error('❌ Erreur lors du parsing du message:', error);
        }
    });

    ws.on('close', () => {
        console.log('👋 Client déconnecté');
        
        if (ws.viewerId) {
            viewers.delete(ws.viewerId);
            console.log(`👁️ Viewer ${ws.viewerId} supprimé - Total viewers:`, viewers.size);
        }
        
        if (ws.isStreamer) {
            streamers.delete(ws);
            console.log(`🎥 Streamer supprimé - Total streamers:`, streamers.size);
            
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
        console.error('❌ Erreur WebSocket:', error);
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
}, 30000); // Toutes les 30 secondes