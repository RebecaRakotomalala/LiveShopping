const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

const viewers = new Map(); // viewerId => socket
const streamers = new Set();

wss.on('connection', ws => {
    ws.on('message', msg => {
        const data = JSON.parse(msg);

        if (data.type === 'streamer') {
            streamers.add(ws);
        }

        if (data.type === 'viewer') {
            ws.viewerId = data.viewerId;
            viewers.set(data.viewerId, ws);
            streamers.forEach(streamer => {
                streamer.send(JSON.stringify({
                    type: 'newViewer',
                    viewerId: data.viewerId
                }));
            });
        }

        if (data.type === 'offer' && data.target === 'viewer') {
            const viewer = viewers.get(data.viewerId);
            if (viewer) viewer.send(msg);
        }

        if (data.type === 'answer' && data.viewerId) {
            streamers.forEach(streamer => streamer.send(msg));
        }

        if (data.type === 'candidate') {
            if (data.target === 'viewer') {
                const viewer = viewers.get(data.viewerId);
                if (viewer) viewer.send(msg);
            } else if (data.target === 'streamer') {
                streamers.forEach(streamer => streamer.send(msg));
            }
        }
    });

    ws.on('close', () => {
        if (ws.viewerId) {
            viewers.delete(ws.viewerId);
        } else {
            streamers.delete(ws);
        }
    });
});
