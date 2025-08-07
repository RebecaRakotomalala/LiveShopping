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

// Fonction pour obtenir l'IP locale
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const interface of interfaces[name]) {
            if (interface.family === 'IPv4' && !interface.internal) {
                return interface.address;
            }
        }
    }
    return '127.0.0.1';
}

const LOCAL_IP = getLocalIP();
console.log(`🌐 IP du serveur: ${LOCAL_IP}`);

// Option 1: HTTPS avec certificats (recommandé pour production)
let server;
let useHTTPS = false;

try {
    // Essayer de charger les certificats
    server = https.createServer({
        cert: fs.readFileSync('cert.pem'),
        key: fs.readFileSync('key.pem')
    });
    useHTTPS = true;
    console.log('🔒 Mode HTTPS activé');
} catch (error) {
    // Si pas de certificats, utiliser HTTP (pour développement uniquement)
    console.log('⚠️ Certificats non trouvés, basculement en HTTP');
    server = http.createServer();
    useHTTPS = false;
}

const wss = new WebSocket.Server({ server });

const viewers = new Map(); // viewerId => { socket, adminId }
const streamers = new Map(); // adminId => socket

console.log('🚀 Serveur WebSocket prêt');

function broadcastActiveStreamers() {
    const activeAdmins = Array.from(streamers.keys());
    console.log(`📡 Diffusion des streamers actifs: [${activeAdmins.join(', ')}]`);
    
    viewers.forEach((viewerData, viewerId) => {
        if (viewerData.socket.readyState === WebSocket.OPEN) {
            viewerData.socket.send(JSON.stringify({
                type: 'activeStreamers',
                streamers: activeAdmins
            }));
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
            else if (data.type === 'viewer' && data.viewerId && data.adminId) {
                viewers.set(data.viewerId, {
                    socket: ws,
                    adminId: data.adminId,
                    clientIP: clientIP
                });
                
                ws.viewerId = data.viewerId;
                ws.adminId = data.adminId;
                ws.clientIP = clientIP;
                
                console.log(`👁️ Viewer ${data.viewerId} depuis ${clientIP} demande le live de ${data.adminId}`);

                const streamerWs = streamers.get(data.adminId);
                if (streamerWs && streamerWs.readyState === WebSocket.OPEN) {
                    streamerWs.send(JSON.stringify({
                        type: 'newViewer',
                        viewerId: data.viewerId,
                        viewerIP: clientIP
                    }));
                    console.log(`✅ Notification envoyée au streamer ${data.adminId}`);
                } else {
                    console.log(`❌ Streamer ${data.adminId} non disponible`);
                    ws.send(JSON.stringify({
                        type: 'streamerUnavailable',
                        adminId: data.adminId
                    }));
                }
            }

            // Offer du streamer vers viewer
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