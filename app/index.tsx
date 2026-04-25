import { Redirect } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/hooks/useTheme';

export default function Index() {
  const { user, role, isLoading } = useAuth();
  const theme = useTheme();

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (role === 'parent') {
    return <Redirect href="/(parent)" />;
  }
  
  if (role === 'teacher') {
    return <Redirect href="/(teacher)" />;
  }

  return <Redirect href="/(student)" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
