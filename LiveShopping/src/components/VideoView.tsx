import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { RTCView } from 'react-native-webrtc';
import { MediaStream } from 'react-native-webrtc';

interface VideoViewProps {
  stream: MediaStream | null;
  style?: any;
  objectFit?: 'contain' | 'cover';
  mirror?: boolean;
}

const VideoView: React.FC<VideoViewProps> = ({ 
  stream, 
  style, 
  objectFit = 'cover',
  mirror = false 
}) => {
  const videoRef = useRef<RTCView>(null);

  useEffect(() => {
    if (stream && videoRef.current) {
      console.log('📹 Affichage du flux vidéo');
    }
  }, [stream]);

  if (!stream) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.placeholder}>
          {/* Placeholder quand pas de flux */}
        </View>
      </View>
    );
  }

  return (
    <RTCView
      ref={videoRef}
      streamURL={stream.toURL()}
      style={[styles.video, style]}
      objectFit={objectFit}
      mirror={mirror}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  video: {
    flex: 1,
    backgroundColor: '#000',
  },
  placeholder: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default VideoView; 