import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { TrendingUp, TrendingDown } from 'lucide-react-native';
import { colors, typography, spacing } from '@/constants/theme';

interface NetBalanceProps {
  balance: number;
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
  showLabel?: boolean;
  style?: ViewStyle;
  loading?: boolean;
}

const NetBalance: React.FC<NetBalanceProps> = ({
  balance,
  size = 'medium',
  showIcon = true,
  showLabel = true,
  loading = false,
  style,
}) => {
  const isPositive = balance > 0;
  const isZero = balance === 0;
  const absoluteBalance = Math.abs(balance);

  const formatAmount = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  };

  const getBalanceColor = () => {
    if (isZero) return colors.textSecondary;
    return isPositive ? colors.success : colors.error;
  };

  const getIcon = () => {
    if (!showIcon || isZero) return null;

    const iconSize = size === 'large' ? 24 : size === 'medium' ? 20 : 16;
    const iconColor = getBalanceColor();

    if (isPositive) {
      return <TrendingUp color={iconColor} size={iconSize} />;
    } else {
      return <TrendingDown color={iconColor} size={iconSize} />;
    }
  };

  const getStyles = () => {
    return {
      container: [styles.container, styles[`${size}Container`], style],
      amount: [styles.amount, styles[`${size}Amount`], { color: getBalanceColor() }],
      label: [styles.label, styles[`${size}Label`]],
    };
  };

  const dynamicStyles = getStyles();

  if (loading) {
    return (
      <View style={dynamicStyles.container}>
        <View style={styles.loadingContainer}>
          <View style={[styles.loadingSkeleton, styles[`${size}LoadingSkeleton`]]} />
          {showLabel && <Text style={dynamicStyles.label}>Loading...</Text>}
        </View>
      </View>
    );
  }

  const accessibilityLabel = `Net balance: ${isPositive ? 'positive' : isZero ? 'zero' : 'negative'} ${formatAmount(absoluteBalance)}`;
  const accessibilityHint = isPositive
    ? 'You have winnings from bets'
    : isZero
      ? 'Your balance is neutral'
      : 'You have losses from bets';

  return (
    <View
      style={dynamicStyles.container}
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
    >
      <View style={styles.balanceRow}>
        {getIcon()}
        <Text style={dynamicStyles.amount}>
          {isPositive ? '+' : isZero ? '' : '-'}
          {formatAmount(absoluteBalance)}
        </Text>
      </View>
      {showLabel && <Text style={dynamicStyles.label}>Net Balance</Text>}
    </View>
  );
};

NetBalance.displayName = 'NetBalance';

export default NetBalance;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  amount: {
    fontWeight: typography.fontWeight.bold,
    fontVariant: ['tabular-nums'],
  },
  label: {
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingSkeleton: {
    backgroundColor: colors.backgroundTertiary,
    borderRadius: 4,
    marginBottom: spacing[1],
  },

  // Size variants
  smallContainer: {
    gap: spacing[1],
  },
  mediumContainer: {
    gap: spacing[2],
  },
  largeContainer: {
    gap: spacing[3],
  },

  smallAmount: {
    fontSize: typography.fontSize.base,
  },
  mediumAmount: {
    fontSize: typography.fontSize.xl,
  },
  largeAmount: {
    fontSize: typography.fontSize['2xl'],
  },

  smallLabel: {
    fontSize: typography.fontSize.xs,
  },
  mediumLabel: {
    fontSize: typography.fontSize.sm,
  },
  largeLabel: {
    fontSize: typography.fontSize.base,
  },

  smallLoadingSkeleton: {
    width: 80,
    height: 16,
  },
  mediumLoadingSkeleton: {
    width: 120,
    height: 20,
  },
  largeLoadingSkeleton: {
    width: 150,
    height: 24,
  },
});
