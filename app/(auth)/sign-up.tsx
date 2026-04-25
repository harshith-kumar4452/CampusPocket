import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { GraduationCap, Mail, Lock, User, Eye, EyeOff, Moon, Sun, Globe, ChevronDown } from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/hooks/useTheme';
import { useThemeContext } from '../../src/context/ThemeContext';
import { useLanguage } from '../../src/context/LanguageContext';
import { Typography } from '../../src/constants/typography';
import { Button } from '../../src/components/ui/Button';
import { UserRole } from '../../src/types/database';

export default function SignUp() {
  const theme = useTheme();
  const { toggleTheme, isDark } = useThemeContext();
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>('student');
  const [loading, setLoading] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  const handleSignUp = async () => {
    const normalizedFullName = fullName.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedFullName || !normalizedEmail || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(normalizedEmail)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const { error } = await signUp(normalizedEmail, password, normalizedFullName, role);
    setLoading(false);
    if (error) {
      Alert.alert('Sign Up Failed', error);
    } else {
      Alert.alert('Success', 'Account created successfully!', [
        { text: 'OK', onPress: () => router.replace('/') },
      ]);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <LinearGradient
            colors={theme.gradient.secondary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            {/* Language Dropdown (Left) */}
            <View style={styles.langDropdownContainer}>
              <Pressable
                onPress={() => setShowLangDropdown(!showLangDropdown)}
                style={[styles.langDropdownBtn, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
              >
                <Globe size={18} color="#FFFFFF" />
                <Text style={styles.langDropdownText}>
                  {language.toUpperCase()}
                </Text>
                <ChevronDown size={16} color="#FFFFFF" />
              </Pressable>

              {showLangDropdown && (
                <View style={[styles.langDropdownMenu, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <Pressable
                    onPress={() => { setLanguage('en'); setShowLangDropdown(false); }}
                    style={[styles.langDropdownItem, language === 'en' && { backgroundColor: theme.primary + '20' }]}
                  >
                    <Text style={[Typography.bodySemiBold, { color: theme.text }]}>English</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => { setLanguage('hi'); setShowLangDropdown(false); }}
                    style={[styles.langDropdownItem, language === 'hi' && { backgroundColor: theme.primary + '20' }]}
                  >
                    <Text style={[Typography.bodySemiBold, { color: theme.text }]}>हिंदी</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => { setLanguage('te'); setShowLangDropdown(false); }}
                    style={[styles.langDropdownItem, language === 'te' && { backgroundColor: theme.primary + '20' }]}
                  >
                    <Text style={[Typography.bodySemiBold, { color: theme.text }]}>తెలుగు</Text>
                  </Pressable>
                </View>
              )}
            </View>

            {/* Theme Toggle (Right) */}
            <View style={styles.themeToggleContainer}>
              <Pressable
                onPress={toggleTheme}
                style={[styles.themeToggleButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
              >
                {isDark ? (
                  <Sun size={20} color="#FBBF24" />
                ) : (
                  <Moon size={20} color="#FFFFFF" />
                )}
              </Pressable>
            </View>
            <View style={styles.headerContent}>
              <View style={styles.logoContainer}>
                <GraduationCap size={40} color="#FFFFFF" />
              </View>
              <Text style={styles.appName}>{t('joinCampus')}</Text>
              <Text style={styles.tagline}>{t('createAccountToGetStarted')}</Text>
            </View>
          </LinearGradient>

          {/* Form */}
          <View
            style={[styles.form, { backgroundColor: theme.background }]}
          >
            {/* Role Selector */}
            <Text style={[Typography.heading, { color: theme.text, marginBottom: 12 }]}>
              {t('iamA')}
            </Text>
            <View style={styles.roleSelector}>
              <Pressable
                onPress={() => setRole('student')}
                style={[
                  styles.roleOption,
                  {
                    backgroundColor: role === 'student' ? theme.primary : theme.surface,
                    borderColor: role === 'student' ? theme.primary : theme.border,
                  },
                ]}
              >
                <GraduationCap
                  size={22}
                  color={role === 'student' ? '#FFFFFF' : theme.textMuted}
                />
                <Text
                  style={[
                    Typography.bodySemiBold,
                    { color: role === 'student' ? '#FFFFFF' : theme.text, marginTop: 4 },
                  ]}
                >
                  {t('student')}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setRole('parent')}
                style={[
                  styles.roleOption,
                  {
                    backgroundColor: role === 'parent' ? theme.secondary : theme.surface,
                    borderColor: role === 'parent' ? theme.secondary : theme.border,
                  },
                ]}
              >
                <User
                  size={22}
                  color={role === 'parent' ? '#FFFFFF' : theme.textMuted}
                />
                <Text
                  style={[
                    Typography.bodySemiBold,
                    { color: role === 'parent' ? '#FFFFFF' : theme.text, marginTop: 4 },
                  ]}
                >
                  {t('parent')}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setRole('teacher')}
                style={[
                  styles.roleOption,
                  {
                    backgroundColor: role === 'teacher' ? theme.success : theme.surface,
                    borderColor: role === 'teacher' ? theme.success : theme.border,
                  },
                ]}
              >
                <GraduationCap
                  size={22}
                  color={role === 'teacher' ? '#FFFFFF' : theme.textMuted}
                />
                <Text
                  style={[
                    Typography.bodySemiBold,
                    { color: role === 'teacher' ? '#FFFFFF' : theme.text, marginTop: 4 },
                  ]}
                >
                  {t('teacher')}
                </Text>
              </Pressable>
            </View>

            {/* Full Name */}
            <View style={[styles.inputContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <User size={20} color={theme.textMuted} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder={t('fullName')}
                placeholderTextColor={theme.textMuted}
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>

            {/* Email */}
            <View style={[styles.inputContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Mail size={20} color={theme.textMuted} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder={t('email')}
                placeholderTextColor={theme.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            {/* Password */}
            <View style={[styles.inputContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Lock size={20} color={theme.textMuted} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder={t('passwordMin6')}
                placeholderTextColor={theme.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <Pressable onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff size={20} color={theme.textMuted} />
                ) : (
                  <Eye size={20} color={theme.textMuted} />
                )}
              </Pressable>
            </View>

            <Button
              title={t('createAccount')}
              onPress={handleSignUp}
              loading={loading}
              style={{ marginTop: 24 }}
              size="large"
            />

            <View style={styles.footer}>
              <Text style={[Typography.body, { color: theme.textMuted }]}>
                {t('alreadyHaveAccount')}{' '}
              </Text>
              <Link href="/(auth)/sign-in" asChild>
                <Pressable>
                  <Text style={[Typography.bodySemiBold, { color: theme.primary }]}>
                    {t('signIn')}
                  </Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 50,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  themeToggleContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  themeToggleButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langDropdownContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 100,
  },
  langDropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 12,
  },
  langDropdownText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  langDropdownMenu: {
    position: 'absolute',
    top: 48,
    left: 0,
    width: 140,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  langDropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  headerContent: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: 'Inter_800ExtraBold',
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
    fontFamily: 'Inter_400Regular',
  },
  form: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  roleSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  roleOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
});
