import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/theme';

interface LoadingProps {
  message?: string;
  size?: 'small' | 'large';
  color?: string;
  overlay?: boolean;
}

export const Loading = React.memo<LoadingProps>(
  ({ message, size = 'large', color = colors.primary, overlay = false }) => {
    const containerStyle = overlay ? styles.overlayContainer : styles.container;

    return (
      <View style={containerStyle}>
        <ActivityIndicator size={size} color={color} accessibilityLabel={message || 'Loading'} />
        {message && (
          <Text style={styles.message} accessibilityLabel={`Loading: ${message}`}>
            {message}
          </Text>
        )}
      </View>
    );
  }
);

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export const LoadingOverlay = React.memo<LoadingOverlayProps>(({ visible, message }) => {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.overlayContent}>
        <Loading message={message} />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  overlayContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  overlayContent: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 32,
    minWidth: 120,
    alignItems: 'center',
  },
});
