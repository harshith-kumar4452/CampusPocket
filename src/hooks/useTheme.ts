import { Colors, ThemeColors } from '../constants/colors';
import { useThemeContext } from '../context/ThemeContext';

export function useTheme(): ThemeColors & { isDark: boolean; scheme: 'light' | 'dark' } {
  const { isDark } = useThemeContext();
  const colors = isDark ? Colors.dark : Colors.light;
  return { ...colors, isDark, scheme: isDark ? 'dark' : 'light' };
}
