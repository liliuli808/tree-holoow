// Root layout for expo-router
import React, { useState, useEffect, createContext, useContext } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';
import { Colors } from '../constants/theme';
import { websocketService } from '../services/websocketService';
import { User } from '../types';

// Auth context
interface AuthContextType {
    user: User | null;
    token: string | null;
    signIn: (token: string) => void;
    signOut: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}

// Paper theme
const theme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        primary: Colors.primary[500],
        secondary: Colors.accent[300],
        background: Colors.background.primary,
        surface: Colors.background.card,
        error: Colors.error,
    },
};

export default function RootLayout() {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const segments = useSegments();

    // Check for existing token on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const storedToken = await SecureStore.getItemAsync('token');
                if (storedToken) {
                    const decoded: { user_id: number; email: string; exp: number } =
                        jwtDecode(storedToken);
                    if (decoded.exp * 1000 > Date.now()) {
                        setToken(storedToken);
                        setUser({
                            id: decoded.user_id.toString(),
                            nickname: decoded.email.split('@')[0],
                            avatarUrl: `https://picsum.photos/seed/${decoded.user_id}/100`,
                            isAnonymous: false,
                        });
                        websocketService.connect(storedToken);
                    } else {
                        await SecureStore.deleteItemAsync('token');
                    }
                }
            } catch (error) {
                console.error('Failed to check auth:', error);
            } finally {
                setIsLoading(false);
            }
        };
        checkAuth();
    }, []);

    // Handle routing based on auth state
    useEffect(() => {
        if (isLoading) return;

        const inAuthGroup = segments[0] === 'login';

        if (!user && !inAuthGroup) {
            router.replace('/login');
        } else if (user && inAuthGroup) {
            router.replace('/');
        }
    }, [user, segments, isLoading]);

    const signIn = async (newToken: string) => {
        try {
            const decoded: { user_id: number; email: string; exp: number } =
                jwtDecode(newToken);
            await SecureStore.setItemAsync('token', newToken);
            setToken(newToken);
            setUser({
                id: decoded.user_id.toString(),
                nickname: decoded.email.split('@')[0],
                avatarUrl: `https://picsum.photos/seed/${decoded.user_id}/100`,
                isAnonymous: false,
            });
            websocketService.connect(newToken);
        } catch (error) {
            console.error('Failed to sign in:', error);
        }
    };

    const signOut = async () => {
        websocketService.disconnect();
        await SecureStore.deleteItemAsync('token');
        setToken(null);
        setUser(null);
    };

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background.primary }}>
                <ActivityIndicator size="large" color={Colors.primary[500]} />
            </View>
        );
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <PaperProvider theme={theme}>
                    <AuthContext.Provider value={{ user, token, signIn, signOut, isLoading }}>
                        <StatusBar style="dark" />
                        <Slot />
                    </AuthContext.Provider>
                </PaperProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}
