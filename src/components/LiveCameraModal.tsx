import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface LiveCameraModalProps {
  visible: boolean;
  onClose: () => void;
  onCapture: (imageSource: { uri: string }) => void;
  title?: string;
}

export const LiveCameraModal: React.FC<LiveCameraModalProps> = ({
  visible,
  onClose,
  onCapture,
  title = 'Kamera Menu Pengelola 📸',
}) => {
  const [streamError, setStreamError] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const videoRef = useRef<any>(null);
  const streamRef = useRef<any>(null);

  const stopTracks = () => {
    if (streamRef.current) {
      try {
        const tracks = streamRef.current.getTracks();
        tracks.forEach((track: any) => track.stop());
      } catch {
        // ignore
      }
      streamRef.current = null;
    }
  };

  const stopStream = () => {
    stopTracks();
    setIsStreaming(false);
  };

  useEffect(() => {
    if (!visible || Platform.OS !== 'web') return;

    let isMounted = true;

    const setupCamera = async () => {
      try {
        if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: 'environment',
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          });
          if (!isMounted) {
            stream.getTracks().forEach((track: any) => track.stop());
            return;
          }
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
          }
          setIsStreaming(true);
        } else {
          setStreamError('Browser tidak mendukung akses kamera langsung.');
        }
      } catch (err: any) {
        if (isMounted) {
          console.log('Live camera error:', err);
          setStreamError('Izin kamera belum diberikan atau perangkat kamera tidak ditemukan.');
        }
      }
    };

    setupCamera();

    return () => {
      isMounted = false;
      stopTracks();
    };
  }, [visible]);

  const handleSnap = () => {
    if (Platform.OS === 'web' && videoRef.current) {
      try {
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          stopStream();
          onCapture({ uri: dataUrl });
          onClose();
        }
      } catch (e) {
        console.error('Snap error:', e);
        setStreamError('Gagal mengambil tangkapan kamera.');
      }
    }
  };

  const handleClose = () => {
    stopStream();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>Arahkan kamera ke hidangan makanan/minuman</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Viewfinder Area */}
          <View style={styles.viewfinderContainer}>
            {Platform.OS === 'web' ? (
              <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', borderRadius: 16, backgroundColor: '#000' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                {/* Viewfinder Grid Overlay */}
                <div
                  style={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    right: 16,
                    bottom: 16,
                    border: '2px dashed rgba(255, 255, 255, 0.7)',
                    borderRadius: 12,
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span
                    style={{
                      color: 'rgba(255, 255, 255, 0.85)',
                      fontSize: '12px',
                      fontWeight: 600,
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      padding: '4px 10px',
                      borderRadius: 20,
                    }}
                  >
                    🍱 Fokuskan Menu Kantin Di Sini
                  </span>
                </div>
              </div>
            ) : (
              <View style={styles.nativeNoticeBox}>
                <Text style={{ fontSize: 36 }}>📸</Text>
                <Text style={styles.nativeNoticeText}>
                  Gunakan tombol di bawah untuk membuka kamera perangkat Anda
                </Text>
              </View>
            )}

            {streamError && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>⚠️ {streamError}</Text>
              </View>
            )}
          </View>

          {/* Controls Footer */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={handleClose} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>Batal</Text>
            </TouchableOpacity>

            {Platform.OS === 'web' && isStreaming && (
              <TouchableOpacity onPress={handleSnap} style={styles.captureBtn}>
                <View style={styles.captureInnerCircle} />
                <Text style={styles.captureBtnText}>📸 Jepret Foto Menu</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '700',
  },
  viewfinderContainer: {
    width: '100%',
    height: 320,
    backgroundColor: '#020617',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nativeNoticeBox: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 8,
  },
  nativeNoticeText: {
    color: '#f8fafc',
    fontSize: 13,
    textAlign: 'center',
  },
  errorBanner: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    borderRadius: 8,
    padding: 8,
  },
  errorText: {
    color: '#ffffff',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    gap: 12,
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  cancelBtnText: {
    color: '#475569',
    fontWeight: '700',
    fontSize: 14,
  },
  captureBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0284c7',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  captureInnerCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#ffffff',
  },
  captureBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
  },
});
