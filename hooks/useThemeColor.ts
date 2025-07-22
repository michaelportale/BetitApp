/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { colors } from '@/constants/theme';
import { useColorScheme } from './useColorScheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof colors
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme as 'light' | 'dark'];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return colors[colorName];
  }
}
