# 🎥 Guide de Configuration du Live Shopping

## 📋 Prérequis

- Node.js (version 18 ou supérieure)
- React Native CLI
- Android Studio (pour Android) ou Xcode (pour iOS)
- Un appareil mobile ou émulateur

## 🚀 Installation et Configuration

### 1. Installation des dépendances

```bash
# Dans le dossier racine du projet
cd LiveShopping
npm install

# Dans le dossier live-server
cd live-server
npm install
```

### 2. Configuration de l'IP du serveur

**IMPORTANT :** Vous devez modifier l'IP du serveur dans le fichier de configuration.

1. Trouvez votre IP locale :
   - **Windows :** `ipconfig`
   - **Mac/Linux :** `ifconfig`

2. Modifiez le fichier `LiveShopping/src/utils/config.ts` :
   ```typescript
   HOST: __DEV__ ? 'VOTRE_IP_ICI' : 'votre-serveur-production.com',
   ```
   
   Remplacez `VOTRE_IP_ICI` par votre IP locale (ex: `192.168.1.100`)

### 3. Démarrage du serveur WebSocket

#### Option A : Script automatique
- **Windows :** Double-cliquez sur `start-live-server.bat`
- **Mac/Linux :** 
  ```bash
  chmod +x start-live-server.sh
  ./start-live-server.sh
  ```

#### Option B : Manuel
```bash
cd live-server
npm start
```

Le serveur sera accessible sur :
- Local : `ws://localhost:8080`
- Réseau : `ws://VOTRE_IP:8080`

### 4. Démarrage de l'application mobile

```bash
cd LiveShopping

# Pour Android
npm run android

# Pour iOS
npm run ios
```

## 🎯 Utilisation

### Pour Streamer (Diffuser en direct)

1. Ouvrez l'application sur votre appareil
2. Allez dans l'écran "Live"
3. Dans la section "Streaming" :
   - Entrez votre ID d'administrateur (ex: "admin1")
   - Cliquez sur "Démarrer le Streaming"
4. Autorisez l'accès à la caméra et au microphone
5. Votre flux vidéo s'affichera dans l'application

### Pour Viewer (Regarder en direct)

1. Ouvrez l'application sur un autre appareil
2. Allez dans l'écran "Live"
3. Dans la section "Viewing" :
   - Entrez votre ID de viewer (ex: "viewer1")
   - Entrez l'ID de l'administrateur à regarder (ex: "admin1")
   - Cliquez sur "Rejoindre le Live"
4. Le flux vidéo du streamer s'affichera automatiquement

## 🔧 Configuration Avancée

### Serveurs STUN/TURN

Pour améliorer la connectivité, vous pouvez ajouter vos propres serveurs STUN/TURN dans `LiveShopping/src/utils/config.ts` :

```typescript
export const WEBRTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    // Ajoutez vos serveurs TURN ici
    { 
      urls: 'turn:votre-serveur-turn.com:3478', 
      username: 'user', 
      credential: 'pass' 
    },
  ],
};
```

### Configuration de la qualité vidéo

Modifiez `LiveShopping/src/utils/config.ts` :

```typescript
export const STREAM_CONFIG = {
  video: {
    width: 1280,    // Largeur
    height: 720,    // Hauteur
    frameRate: 30,  // FPS
  },
  audio: {
    sampleRate: 48000,
    channelCount: 2,
  },
};
```

## 🐛 Dépannage

### Problème de connexion WebSocket

1. Vérifiez que le serveur est démarré
2. Vérifiez que l'IP dans `config.ts` est correcte
3. Vérifiez que le pare-feu n'empêche pas la connexion
4. Testez la connexion avec un navigateur : `ws://VOTRE_IP:8080`

### Problème de vidéo

1. Vérifiez les permissions caméra/microphone
2. Redémarrez l'application
3. Vérifiez que les deux appareils sont sur le même réseau

### Problème de performance

1. Réduisez la qualité vidéo dans `config.ts`
2. Utilisez un réseau WiFi stable
3. Fermez les autres applications gourmandes

## 📱 Test Multi-Appareils

Pour tester entre plusieurs PC/appareils :

1. **PC 1 (Serveur + Streamer) :**
   - Démarrez le serveur WebSocket
   - Lancez l'app sur un émulateur ou appareil connecté
   - Démarrez le streaming

2. **PC 2 (Viewer) :**
   - Modifiez l'IP dans `config.ts` pour pointer vers PC 1
   - Lancez l'app sur un émulateur ou appareil
   - Rejoignez le live

## 🔒 Sécurité

- Le mode HTTP est utilisé pour le développement
- Pour la production, configurez HTTPS avec des certificats SSL
- Ajoutez une authentification si nécessaire

## 📞 Support

En cas de problème :
1. Vérifiez les logs dans la console
2. Vérifiez la connexion réseau
3. Redémarrez le serveur et l'application 