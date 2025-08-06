const fs = require('fs');
const https = require('https');
const http = require('http');
const WebSocket = require('ws');
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
const PORT = process.env.PORT || 8080;

console.log(`🌐 IP du serveur: ${LOCAL_IP}`);
console.log(`🚀 Port du serveur: ${PORT}`);

// Option 1: HTTPS avec certificats (recommandé pour production)
let server;
let useHTTPS = false;
try {
    // Essayer de charger les certificats
    server = https.createServer({
        cert: fs.readFileSync(__dirname + "/certs/server-cert.pem"), // certificat public
        key: fs.readFileSync(__dirname + "/certs/server-key.pem")    // clé privée
    });
    useHTTPS = true;
    console.log('🔒 Mode HTTPS activé');
} catch (error) {
    // Si pas de certificats, utiliser HTTP (pour développement uniquement)
    console.log('⚠️ Certificats non trouvés, basculement en HTTP');
    server = http.createServer();
    useHTTPS = false;
}

// Écouter sur toutes les interfaces réseau pour permettre l'accès depuis d'autres PC
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🎯 Serveur démarré sur ${useHTTPS ? 'https' : 'http'}://${LOCAL_IP}:${PORT}`);
    console.log(`🔌 WebSocket disponible sur ${useHTTPS ? 'wss' : 'ws'}://${LOCAL_IP}:${PORT}`);
});

const wss = new WebSocket.Server({ server });
const viewers = new Map(); // viewerId => { socket, adminId }
const streamers = new Map(); // adminId => socket

console.log('🚀 Serveur WebSocket prêt');
function broadcastActiveStreamers() {
    const activeAdmins = Array.from(streamers.keys());
    console.log(`:antenne_satellite: Diffusion des streamers actifs: [${activeAdmins.join(', ')}]`);
    viewers.forEach((viewerData, viewerId) => {
        if (viewerData.socket.readyState === WebSocket.OPEN) {
            viewerData.socket.send(JSON.stringify({
                type: 'activeStreamers',
                streamers: activeAdmins
            }));
        }
    });
}
wss.on('connection', (ws, req) => {
    const clientIP = req.socket.remoteAddress || req.connection.remoteAddress;
    console.log(`:homme_levant_la_main: Nouvelle connexion depuis ${clientIP}`);
    // Ping/Pong pour maintenir la connexion
    ws.isAlive = true;
    ws.on('pong', () => {
        ws.isAlive = true;
    });
    ws.on('message', msg => {
        try {
            const data = JSON.parse(msg);
            console.log(`:enveloppe_avec_flèche: Message de ${clientIP}:`, data.type);
            // Streamer se connecte
            if (data.type === 'streamer' && data.adminId) {
                streamers.set(data.adminId, ws);
                ws.isStreamer = true;
                ws.adminId = data.adminId;
                ws.clientIP = clientIP;
                console.log(`:filmer: Streamer connecté [adminId=${data.adminId}] depuis ${clientIP}`);
                broadcastActiveStreamers();
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
                console.log(`:œil: Viewer ${data.viewerId} depuis ${clientIP} demande le live de ${data.adminId}`);
                const streamerWs = streamers.get(data.adminId);
                if (streamerWs && streamerWs.readyState === WebSocket.OPEN) {
                    streamerWs.send(JSON.stringify({
                        type: 'newViewer',
                        viewerId: data.viewerId,
                        viewerIP: clientIP
                    }));
                    console.log(`:coche_blanche: Notification envoyée au streamer ${data.adminId}`);
                } else {
                    console.log(`:x: Streamer ${data.adminId} non disponible`);
                    ws.send(JSON.stringify({
                        type: 'streamerUnavailable',
                        adminId: data.adminId
                    }));
                }
            }
            // Offer du streamer vers viewer
            else if (data.type === 'offer' && data.viewerId) {
                const viewerData = viewers.get(data.viewerId);
                if (viewerData && viewerData.socket.readyState === WebSocket.OPEN) {
                    viewerData.socket.send(JSON.stringify({
                        type: 'offer',
                        offer: data.offer,
                        viewerId: data.viewerId
                    }));
                    console.log(`:outbox: Offer envoyée au viewer ${data.viewerId}`);
                } else {
                    console.log(`:x: Viewer ${data.viewerId} non trouvé ou déconnecté`);
                }
            }
            // Answer du viewer vers streamer
            else if (data.type === 'answer' && data.viewerId) {
                const viewerData = viewers.get(data.viewerId);
                if (viewerData) {
                    const streamerWs = streamers.get(viewerData.adminId);
                    if (streamerWs && streamerWs.readyState === WebSocket.OPEN) {
                        streamerWs.send(JSON.stringify({
                            type: 'answer',
                            answer: data.answer,
                            viewerId: data.viewerId
                        }));
                        console.log(`:outbox: Answer envoyée au streamer ${viewerData.adminId}`);
                    }
                }
            }
            // ICE candidates
            else if (data.type === 'candidate') {
                if (data.target === 'viewer' && data.viewerId) {
                    const viewerData = viewers.get(data.viewerId);
                    if (viewerData && viewerData.socket.readyState === WebSocket.OPEN) {
                        viewerData.socket.send(JSON.stringify({
                            type: 'candidate',
                            candidate: data.candidate,
                            viewerId: data.viewerId
                        }));
                    }
                } else if (data.target === 'streamer' && data.viewerId) {
                    const viewerData = viewers.get(data.viewerId);
                    if (viewerData) {
                        const streamer = streamers.get(viewerData.adminId);
                        if (streamer && streamer.readyState === WebSocket.OPEN) {
                            streamer.send(JSON.stringify({
                                type: 'candidate',
                                candidate: data.candidate,
                                viewerId: data.viewerId
                            }));
                        }
                    }
                }
            }
            // Demande de liste des streamers actifs
            else if (data.type === 'getActiveStreamers') {
                const activeAdmins = Array.from(streamers.keys());
                ws.send(JSON.stringify({
                    type: 'activeStreamers',
                    streamers: activeAdmins
                }));
            }
        } catch (error) {
            console.error(`:x: Erreur parsing JSON depuis ${clientIP}:`, error);
        }
    });
    ws.on('close', () => {
        console.log(`:prise_électrique: Connexion fermée depuis ${clientIP}`);
        if (ws.viewerId) {
            viewers.delete(ws.viewerId);
            console.log(`:œil: Viewer ${ws.viewerId} déconnecté`);
        }
        if (ws.isStreamer && ws.adminId) {
            streamers.delete(ws.adminId);
            console.log(`:filmer: Streamer ${ws.adminId} déconnecté`);
            // Notifier les viewers que le streamer est déconnecté
            viewers.forEach((viewerData, viewerId) => {
                if (viewerData.adminId === ws.adminId && viewerData.socket.readyState === WebSocket.OPEN) {
                    viewerData.socket.send(JSON.stringify({
                        type: 'streamerDisconnected',
                        adminId: ws.adminId
                    }));
                }
            });
            broadcastActiveStreamers();
        }
    });
    ws.on('error', (error) => {
        console.error(`:x: Erreur WebSocket depuis ${clientIP}:`, error);
    });
    // Envoyer la liste des streamers actifs au nouveau client
    setTimeout(() => {
        if (ws.readyState === WebSocket.OPEN) {
            broadcastActiveStreamers();
        }
    }, 1000);
});
// Heartbeat pour maintenir les connexions
const interval = setInterval(() => {
    wss.clients.forEach(ws => {
        if (ws.isAlive === false) {
            console.log(`:crâne: Connexion morte détectée, fermeture...`);
            return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
    });
}, 30000);
wss.on('close', () => {
    clearInterval(interval);
});
// Nettoyage régulier
setInterval(() => {
    let cleaned = 0;
    viewers.forEach((viewerData, viewerId) => {
        if (viewerData.socket.readyState !== WebSocket.OPEN) {
            viewers.delete(viewerId);
            cleaned++;
        }
    });
    streamers.forEach((ws, adminId) => {
        if (ws.readyState !== WebSocket.OPEN) {
            streamers.delete(adminId);
            cleaned++;
        }
    });
    if (cleaned > 0) {
        console.log(`:balai: Nettoyage: ${cleaned} connexions fermées supprimées`);
        broadcastActiveStreamers();
    }
}, 60000);
// Démarrage du serveur
// Gestion des signaux pour fermeture propre
process.on('SIGINT', () => {
    console.log('\n:panneau_octogonal: Arrêt du serveur...');
    clearInterval(interval);
    server.close(() => {
        console.log(':coche_blanche: Serveur arrêté proprement');
        process.exit(0);
    });
});
// Logs de diagnostic au démarrage
console.log(`\n:histogramme: Informations système:`);
console.log(`   - Node.js: ${process.version}`);
console.log(`   - Platform: ${process.platform}`);
console.log(`   - Architecture: ${process.arch}`);
console.log(`   - Interfaces réseau:`);
const interfaces = os.networkInterfaces();
Object.keys(interfaces).forEach(name => {
    interfaces[name].forEach(interface => {
        if (interface.family === 'IPv4') {
            const type = interface.internal ? '(interne)' : '(externe)';
            console.log(`     ${name}: ${interface.address} ${type}`);
        }
    });
});
