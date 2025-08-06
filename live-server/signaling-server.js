const fs = require('fs');
const https = require('https');
const WebSocket = require('ws');

// Charger tes certificats
const server = https.createServer({
  cert: fs.readFileSync('cert.pem'),
  key: fs.readFileSync('key.pem')
});

const wss = new WebSocket.Server({ server });

const viewers = new Map(); // viewerId => socket
const streamers = new Map(); // adminId => socket

console.log('🚀 Serveur WebSocket (WSS) prêt');

function broadcastActiveStreamers() {
    const activeAdmins = Array.from(streamers.keys());
    viewers.forEach(viewerWs => {
      if (viewerWs.readyState === WebSocket.OPEN) {
        viewerWs.send(JSON.stringify({
          type: 'activeStreamers',
          streamers: activeAdmins
        }));
      }
    });
  }

wss.on('connection', ws => {
    console.log('🙋‍♂️ Nouveau client connecté');

    ws.on('message', msg => {
        try {
            const data = JSON.parse(msg);
            console.log("📩 Message reçu:", data.type, data);

            // Streamer se connecte
            if (data.type === 'streamer' && data.adminId) {
                streamers.set(data.adminId, ws);
                ws.isStreamer = true;
                ws.adminId = data.adminId;
                console.log(`🎥 Streamer connecté [adminId=${data.adminId}]`);
                broadcastActiveStreamers();
            }

            // Viewer se connecte
            else if (data.type === 'viewer' && data.viewerId && data.adminId) {
                viewers.set(data.viewerId, ws);
                ws.viewerId = data.viewerId;
                ws.adminId = data.adminId;
                console.log(`👁️ Viewer ${data.viewerId} demande le live de ${data.adminId}`);

                const streamerWs = streamers.get(data.adminId);
                if (streamerWs && streamerWs.readyState === WebSocket.OPEN) {
                    streamerWs.send(JSON.stringify({
                        type: 'newViewer',
                        viewerId: data.viewerId
                    }));
                } else {
                    ws.send(JSON.stringify({
                        type: 'streamerUnavailable'
                    }));
                }
            }

            // Offer
            else if (data.type === 'offer' && data.viewerId) {
                const viewer = viewers.get(data.viewerId);
                if (viewer && viewer.readyState === WebSocket.OPEN) {
                    viewer.send(JSON.stringify({
                        type: 'offer',
                        offer: data.offer,
                        viewerId: data.viewerId
                    }));
                }
            }

            // Answer
            else if (data.type === 'answer' && data.viewerId) {
                const viewerWs = viewers.get(data.viewerId);
                const streamerWs = streamers.get(viewerWs?.adminId);
                if (streamerWs && streamerWs.readyState === WebSocket.OPEN) {
                    streamerWs.send(JSON.stringify({
                        type: 'answer',
                        answer: data.answer,
                        viewerId: data.viewerId
                    }));
                }
            }

            // ICE candidate
            else if (data.type === 'candidate') {
                if (data.target === 'viewer' && data.viewerId) {
                    const viewer = viewers.get(data.viewerId);
                    if (viewer && viewer.readyState === WebSocket.OPEN) {
                        viewer.send(JSON.stringify({
                            type: 'candidate',
                            candidate: data.candidate,
                            viewerId: data.viewerId
                        }));
                    }
                } else if (data.target === 'streamer' && data.viewerId) {
                    const viewerWs = viewers.get(data.viewerId);
                    const adminId = viewerWs?.adminId;
                    const streamer = streamers.get(adminId);
                    if (streamer && streamer.readyState === WebSocket.OPEN) {
                        streamer.send(JSON.stringify({
                            type: 'candidate',
                            candidate: data.candidate,
                            viewerId: data.viewerId
                        }));
                    }
                }
            }

        } catch (error) {
            console.error('❌ Erreur parsing JSON:', error);
        }
    });

    ws.on('close', () => {
        if (ws.viewerId) {
            viewers.delete(ws.viewerId);
            console.log(`👁️ Viewer ${ws.viewerId} déconnecté`);
        }

        if (ws.isStreamer && ws.adminId) {
            streamers.delete(ws.adminId);
            console.log(`🎥 Streamer ${ws.adminId} déconnecté`);
            broadcastActiveStreamers();
        }
    });

    ws.on('error', (error) => {
        console.error('❌ Erreur WebSocket:', error);
    });
});

const PORT = 9090;
server.listen(PORT, () => {
  console.log(`🚀 Serveur HTTPS + WSS démarré sur le port ${PORT}`);
});

// Ménage régulier
setInterval(() => {
    viewers.forEach((ws, viewerId) => {
        if (ws.readyState !== WebSocket.OPEN) {
            viewers.delete(viewerId);
        }
    });

    streamers.forEach((ws, adminId) => {
        if (ws.readyState !== WebSocket.OPEN) {
            streamers.delete(adminId);
        }
    });

    broadcastActiveStreamers();
}, 30000);
