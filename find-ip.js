const os = require('os');

function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const interface of interfaces[name]) {
            // Ignorer les interfaces loopback et les IPv6
            if (interface.family === 'IPv4' && !interface.internal) {
                return interface.address;
            }
        }
    }
    return '127.0.0.1';
}

const ip = getLocalIP();
console.log('🌐 Votre IP locale est:', ip);
console.log('🔌 Le serveur WebSocket sera accessible sur:');
console.log(`   - Local: ws://localhost:8080`);
console.log(`   - Réseau: ws://${ip}:8080`);
console.log('');
console.log('📝 Pour configurer l\'app mobile, modifiez:');
console.log('   LiveShopping/src/utils/config.ts');
console.log(`   HOST: __DEV__ ? '${ip}' : 'votre-serveur-production.com',`); 