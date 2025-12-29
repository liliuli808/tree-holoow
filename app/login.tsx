// Login page - React Native version
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from './_layout';
import { login, register, sendVerificationCode } from '../services/authService';
import { Colors, Spacing, BorderRadius } from '../constants/theme';

export default function LoginScreen() {
    const { signIn } = useAuth();
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [codeSent, setCodeSent] = useState(false);
    const [countdown, setCountdown] = useState(0);

    const startCountdown = () => {
        setCountdown(60);
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleSendCode = async () => {
        if (!email) {
            Alert.alert('提示', '请输入邮箱地址');
            return;
        }

        try {
            setIsLoading(true);
            await sendVerificationCode(email);
            setCodeSent(true);
            startCountdown();
            Alert.alert('成功', '验证码已发送到您的邮箱');
        } catch (error: any) {
            Alert.alert('错误', error.message || '发送验证码失败');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!email || !password) {
            Alert.alert('提示', '请填写所有字段');
            return;
        }

        if (isRegister && !code) {
            Alert.alert('提示', '请输入验证码');
            return;
        }

        try {
            setIsLoading(true);
            if (isRegister) {
                await register(email, code, password);
                Alert.alert('成功', '注册成功，请登录');
                setIsRegister(false);
                setCode('');
            } else {
                const token = await login(email, password);
                signIn(token);
            }
        } catch (error: any) {
            Alert.alert('错误', error.message || '操作失败');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Logo */}
                    <View style={styles.logoContainer}>
                        <View style={styles.logoCircle}>
                            <Ionicons name="leaf" size={48} color={Colors.primary[500]} />
                        </View>
                        <Text style={styles.title}>树洞交友</Text>
                        <Text style={styles.subtitle}>遇见有趣的灵魂</Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        <View style={styles.inputContainer}>
                            <Ionicons
                                name="mail-outline"
                                size={20}
                                color={Colors.text.muted}
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="邮箱"
                                placeholderTextColor={Colors.text.muted}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Ionicons
                                name="lock-closed-outline"
                                size={20}
                                color={Colors.text.muted}
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="密码"
                                placeholderTextColor={Colors.text.muted}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                style={styles.eyeButton}
                            >
                                <Ionicons
                                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                                    size={20}
                                    color={Colors.text.muted}
                                />
                            </TouchableOpacity>
                        </View>

                        {isRegister && (
                            <View style={styles.inputContainer}>
                                <Ionicons
                                    name="key-outline"
                                    size={20}
                                    color={Colors.text.muted}
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={[styles.input, { flex: 1 }]}
                                    placeholder="验证码"
                                    placeholderTextColor={Colors.text.muted}
                                    value={code}
                                    onChangeText={setCode}
                                    keyboardType="number-pad"
                                />
                                <TouchableOpacity
                                    style={[
                                        styles.codeButton,
                                        countdown > 0 && styles.codeButtonDisabled,
                                    ]}
                                    onPress={handleSendCode}
                                    disabled={countdown > 0 || isLoading}
                                >
                                    <Text style={styles.codeButtonText}>
                                        {countdown > 0 ? `${countdown}s` : '发送验证码'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        <TouchableOpacity
                            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                            onPress={handleSubmit}
                            disabled={isLoading}
                        >
                            <Text style={styles.submitButtonText}>
                                {isLoading ? '处理中...' : isRegister ? '注册' : '登录'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.switchButton}
                            onPress={() => setIsRegister(!isRegister)}
                        >
                            <Text style={styles.switchText}>
                                {isRegister ? '已有账号？去登录' : '没有账号？去注册'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background.primary,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: Spacing.lg,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: Spacing.xl * 2,
    },
    logoCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.primary[50],
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: Colors.text.primary,
        marginBottom: Spacing.xs,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.text.muted,
    },
    form: {
        width: '100%',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background.secondary,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.md,
        paddingHorizontal: Spacing.md,
        height: 56,
    },
    inputIcon: {
        marginRight: Spacing.sm,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: Colors.text.primary,
    },
    eyeButton: {
        padding: Spacing.xs,
    },
    codeButton: {
        backgroundColor: Colors.primary[500],
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
    },
    codeButtonDisabled: {
        backgroundColor: Colors.text.muted,
    },
    codeButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    submitButton: {
        backgroundColor: Colors.primary[500],
        borderRadius: BorderRadius.lg,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Spacing.md,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    switchButton: {
        alignItems: 'center',
        marginTop: Spacing.lg,
    },
    switchText: {
        color: Colors.primary[500],
        fontSize: 15,
    },
});
