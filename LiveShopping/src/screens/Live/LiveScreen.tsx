import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import VideoView from '../../components/VideoView';
import { webRTCService } from '../../utils/WebRTCService';
import { webSocketService } from '../../utils/WebSocketService';
import { MediaStream } from 'react-native-webrtc';

export default function LiveScreen() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [adminId, setAdminId] = useState('');
  const [viewerId, setViewerId] = useState('');
  const [targetAdminId, setTargetAdminId] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Vérifier la connexion WebSocket
    const checkConnection = () => {
      setIsConnected(webSocketService.isConnected());
    };

    checkConnection();
    const interval = setInterval(checkConnection, 2000);

    return () => {
      clearInterval(interval);
      webRTCService.stop();
    };
  }, []);

  useEffect(() => {
    // Configurer le callback pour le flux distant
    webRTCService.onRemoteStreamReceived = (stream) => {
      setRemoteStream(stream);
    };
  }, []);

  const startStreaming = async () => {
    if (!adminId.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un ID d\'administrateur');
      return;
    }

    try {
      const stream = await webRTCService.startStreaming(adminId);
      setLocalStream(stream);
      setIsStreaming(true);
      Alert.alert('Succès', 'Streaming démarré !');
    } catch (error) {
      console.error('Erreur démarrage streaming:', error);
      Alert.alert('Erreur', 'Impossible de démarrer le streaming');
    }
  };

  const stopStreaming = () => {
    webRTCService.stop();
    setLocalStream(null);
    setIsStreaming(false);
    Alert.alert('Info', 'Streaming arrêté');
  };

  const startViewing = async () => {
    if (!viewerId.trim() || !targetAdminId.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un ID de viewer et un ID d\'administrateur');
      return;
    }

    try {
      await webRTCService.startViewing(viewerId, targetAdminId);
      setIsViewing(true);
      Alert.alert('Succès', 'Viewing démarré !');
    } catch (error) {
      console.error('Erreur démarrage viewing:', error);
      Alert.alert('Erreur', 'Impossible de démarrer le viewing');
    }
  };

  const stopViewing = () => {
    webRTCService.stop();
    setRemoteStream(null);
    setIsViewing(false);
    Alert.alert('Info', 'Viewing arrêté');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Statut de connexion */}
        <View style={styles.statusContainer}>
          <View style={[styles.statusIndicator, { backgroundColor: isConnected ? '#4CAF50' : '#F44336' }]} />
          <Text style={styles.statusText}>
            {isConnected ? 'Connecté au serveur' : 'Déconnecté du serveur'}
          </Text>
        </View>

        {/* Section Streaming */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎥 Streaming</Text>
          
          <TextInput
            style={styles.input}
            placeholder="ID Administrateur"
            value={adminId}
            onChangeText={setAdminId}
            editable={!isStreaming}
          />

          {!isStreaming ? (
            <TouchableOpacity style={styles.button} onPress={startStreaming}>
              <Text style={styles.buttonText}>Démarrer le Streaming</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.button, styles.stopButton]} onPress={stopStreaming}>
              <Text style={styles.buttonText}>Arrêter le Streaming</Text>
            </TouchableOpacity>
          )}

          {localStream && (
            <View style={styles.videoContainer}>
              <Text style={styles.videoLabel}>Votre flux vidéo :</Text>
              <VideoView stream={localStream} style={styles.video} mirror={true} />
            </View>
          )}
        </View>

        {/* Section Viewing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👁️ Viewing</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Votre ID de viewer"
            value={viewerId}
            onChangeText={setViewerId}
            editable={!isViewing}
          />

          <TextInput
            style={styles.input}
            placeholder="ID Administrateur à regarder"
            value={targetAdminId}
            onChangeText={setTargetAdminId}
            editable={!isViewing}
          />

          {!isViewing ? (
            <TouchableOpacity style={styles.button} onPress={startViewing}>
              <Text style={styles.buttonText}>Rejoindre le Live</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.button, styles.stopButton]} onPress={stopViewing}>
              <Text style={styles.buttonText}>Quitter le Live</Text>
            </TouchableOpacity>
          )}

          {remoteStream && (
            <View style={styles.videoContainer}>
              <Text style={styles.videoLabel}>Flux distant :</Text>
              <VideoView stream={remoteStream} style={styles.video} />
            </View>
          )}
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>📋 Instructions :</Text>
          <Text style={styles.instructionsText}>
            1. Assurez-vous que le serveur WebSocket est démarré{'\n'}
            2. Pour streamer : entrez votre ID et cliquez sur "Démarrer le Streaming"{'\n'}
            3. Pour regarder : entrez votre ID et l'ID du streamer, puis cliquez sur "Rejoindre le Live"{'\n'}
            4. Les flux vidéo s'afficheront automatiquement
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    padding: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  stopButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  videoContainer: {
    marginTop: 15,
  },
  videoLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  video: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
  },
  instructions: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  instructionsText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
});
