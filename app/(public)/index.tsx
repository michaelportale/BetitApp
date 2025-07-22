import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { Users, Trophy, Shield, Zap, Code } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/theme';

const Button = ({
  children,
  onPress,
  style,
  textStyle,
}: {
  children: React.ReactNode;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
}) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.button, style]}>
      <Text style={[styles.buttonText, textStyle]}>{children}</Text>
    </TouchableOpacity>
  );
};

const features = [
  {
    icon: Users,
    title: 'Friends Only',
    description: 'Private groups for trusted betting circles',
  },
  {
    icon: Trophy,
    title: 'Proof System',
    description: 'Democratic voting or trusted arbiters',
  },
  {
    icon: Shield,
    title: 'No Real Money',
    description: 'IOU tracking keeps it fun and social',
  },
  {
    icon: Zap,
    title: 'Fast & Simple',
    description: 'Create, accept, and resolve bets instantly',
  },
];

const HeroScreen = () => {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/login');
  };

  return (
    <ScrollView style={styles.container}>
      <View
        style={[styles.heroImage, { backgroundColor: 'rgba(14, 116, 144, 0.1)' }]}
      >
        <View style={styles.heroContent}>
          <Text style={styles.title}>BetIt</Text>
          <Text style={styles.subtitle}>
            Make friendly bets with your crew. No money, just bragging rights and IOUs.
          </Text>

          <View style={styles.buttonContainer}>
            <Button
              onPress={handleGetStarted}
              style={styles.primaryButton}
              textStyle={styles.primaryButtonText}
            >
              Get Started
            </Button>
            <Button
              onPress={() => router.push('/dev-login')}
              style={styles.devButton}
              textStyle={styles.devButtonText}
            >
              <Code color={colors.primary} size={16} style={{ marginRight: 8 }} />
              Dev Login
            </Button>
          </View>
        </View>
      </View>

      <View style={styles.featuresSection}>
        <Text style={styles.featuresTitle}>Why Friends Choose BetIt</Text>
        <View style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <feature.icon color="white" size={24} />
              </View>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default HeroScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1e',
  },
  heroImage: {
    height: 500,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(28, 28, 30, 0.8)',
  },
  title: {
    fontSize: 60,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 18,
    color: '#8e8e93',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  buttonContainer: {
    flexDirection: 'column',
    gap: 12,
    alignItems: 'center',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#0e7490',
  },
  primaryButtonText: {
    color: 'white',
  },
  secondaryButton: {
    backgroundColor: '#2c2c2e',
  },
  secondaryButtonText: {
    color: 'white',
  },
  devButton: {
    backgroundColor: colors.backgroundTertiary,
    borderWidth: 1,
    borderColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
  },
  devButtonText: {
    color: colors.primary,
    fontSize: 14,
  },
  featuresSection: {
    padding: 16,
    backgroundColor: '#2c2c2e',
  },
  featuresTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 32,
    color: 'white',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  featureCard: {
    width: '45%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(44, 44, 46, 0.5)',
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#0e7490',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  featureDescription: {
    fontSize: 14,
    color: '#8e8e93',
    textAlign: 'center',
  },
});
