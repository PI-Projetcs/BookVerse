import React from 'react';
import { Alert, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { FOOTER_GRADIENT_COLORS, footerStyles } from '../styles/footerStyles';

const NAV_ITEMS = [
	{ key: 'inicio', label: 'Inicio', icon: 'home-outline', activeIcon: 'home', route: 'Home' },
	{ key: 'livros', label: 'Livros', icon: 'book-outline', activeIcon: 'book', route: 'Catalog' },
	{ key: 'discussao', label: 'Discussao', icon: 'chatbubble-ellipses-outline', activeIcon: 'chatbubble-ellipses', route: 'Discussion' },
	{ key: 'agenda', label: 'Agenda', icon: 'calendar-outline', activeIcon: 'calendar', route: 'Agenda' },
	{ key: 'perfil', label: 'Perfil', icon: 'person-outline', activeIcon: 'person', route: 'Profile' },
];

export default function FooterNav({ navigation, activeKey = 'livros' }) {
	const handlePress = (item) => {
		if (!navigation || typeof navigation.navigate !== 'function') {
			return;
		}

		const routeNames = navigation.getState?.()?.routeNames || [];
		if (!routeNames.includes(item.route)) {
			Alert.alert('Rota indisponivel', `${item.label} ainda nao foi implementada.`);
			return;
		}

		navigation.navigate(item.route);
	};

	return (
		<LinearGradient
			colors={FOOTER_GRADIENT_COLORS}
			start={{ x: 0, y: 0.5 }}
			end={{ x: 1, y: 0.5 }}
			style={footerStyles.wrapper}
		>
			{NAV_ITEMS.map((item) => {
				const isActive = item.key === activeKey;
				return (
					<TouchableOpacity
						key={item.key}
						style={[footerStyles.item, isActive && footerStyles.itemActive]}
						onPress={() => handlePress(item)}
						activeOpacity={0.85}
					>
						<Ionicons
							name={isActive ? item.activeIcon : item.icon}
							size={18}
							color={isActive ? '#fde68a' : '#d1d5db'}
						/>
						<Text style={[footerStyles.label, isActive && footerStyles.labelActive]}>{item.label}</Text>
					</TouchableOpacity>
				);
			})}
		</LinearGradient>
	);
}
