import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
	clearStoredSession,
	getStoredSession,
	setStoredSession,
} from '../services/sessionStorage';
import {
	applyApiSession,
	clearApiSession,
	setSessionRefreshHandler,
	setUnauthorizedHandler,
} from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
	const [session, setSession] = useState(null);
	const [isBootstrapping, setIsBootstrapping] = useState(true);

	useEffect(() => {
		let isMounted = true;

		const restoreSession = async () => {
			const restored = await getStoredSession();
			if (!isMounted) {
				return;
			}

			applyApiSession(restored);
			setSession(restored);
			setIsBootstrapping(false);
		};

		restoreSession();

		return () => {
			isMounted = false;
		};
	}, []);

	useEffect(() => {
		setUnauthorizedHandler(async () => {
			await clearStoredSession();
			clearApiSession();
			setSession(null);
		});

		setSessionRefreshHandler(async (tokens) => {
			let updatedSession = null;

			setSession((previousSession) => {
				if (!previousSession) {
					return previousSession;
				}

				updatedSession = {
					...previousSession,
					token: tokens?.token ? String(tokens.token) : previousSession.token,
					refreshToken: tokens?.refreshToken
						? String(tokens.refreshToken)
						: previousSession.refreshToken,
				};

				return updatedSession;
			});

			if (!updatedSession) {
				return;
			}

			await setStoredSession(updatedSession);
			applyApiSession(updatedSession);
		});

		return () => {
			setUnauthorizedHandler(null);
			setSessionRefreshHandler(null);
		};
	}, []);

	const signIn = async (nextSession) => {
		const normalizedSession = {
			...nextSession,
			email: String(nextSession?.email || '').trim().toLowerCase(),
			token: nextSession?.token ? String(nextSession.token) : null,
			refreshToken: nextSession?.refreshToken ? String(nextSession.refreshToken) : null,
			lastLoginAt: nextSession?.lastLoginAt || new Date().toISOString(),
		};

		await setStoredSession(normalizedSession);
		applyApiSession(normalizedSession);
		setSession(normalizedSession);
		return normalizedSession;
	};

	const signOut = async () => {
		await clearStoredSession();
		clearApiSession();
		setSession(null);
	};

	const value = useMemo(
		() => ({
			session,
			role: session?.role || null,
			isAuthenticated: Boolean(session?.role && session?.token),
			isBootstrapping,
			signIn,
			signOut,
		}),
		[session, isBootstrapping]
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuth must be used inside AuthProvider');
	}

	return context;
}