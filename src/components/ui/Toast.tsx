import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Platform } from 'react-native';
import { AlertCircle, CheckCircle, X } from 'lucide-react-native';
import { colors } from '@/constants/theme';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onDismiss?: () => void;
  visible: boolean;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 4000,
  onDismiss,
  visible,
}) => {
  const translateY = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      // Slide down
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();

      // Auto dismiss
      const timer = setTimeout(() => {
        onDismiss?.();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      // Slide up
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, translateY, duration, onDismiss]);

  if (!visible) {
    return null;
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle color={colors.white} size={20} />;
      case 'error':
        return <AlertCircle color={colors.white} size={20} />;
      default:
        return <AlertCircle color={colors.white} size={20} />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return colors.success;
      case 'error':
        return colors.error;
      default:
        return colors.info;
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={styles.content}>
        {getIcon()}
        <Text
          style={styles.message}
          accessibilityLabel={`${type} message: ${message}`}
          accessibilityRole="alert"
        >
          {message}
        </Text>
        <TouchableOpacity
          onPress={onDismiss}
          style={styles.dismissButton}
          accessibilityLabel="Dismiss notification"
          accessibilityRole="button"
        >
          <X color={colors.white} size={20} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 16,
    right: 16,
    borderRadius: 12,
    zIndex: 1000,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  message: {
    flex: 1,
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  dismissButton: {
    padding: 4,
  },
});
