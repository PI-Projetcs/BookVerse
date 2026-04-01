import React from 'react';
import { Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { HEADER_GRADIENT_COLORS, headerStyles } from '../styles/headerStyles';

export default function Header({
	title = 'BookVerse',
	subtitle = 'Seu clube do livro digital',
	colors = HEADER_GRADIENT_COLORS,
}) {
	return (
		<LinearGradient
			colors={colors}
			start={{ x: 0, y: 0 }}
			end={{ x: 1, y: 0 }}
			style={headerStyles.container}
		>
			<View style={headerStyles.overlay}>
				<View style={headerStyles.brandRow}>
					<MaterialCommunityIcons name="book-open-page-variant" size={32} color="#facc15" />
					<Text style={headerStyles.brandTitle}>{title}</Text>
				</View>
				<Text style={headerStyles.brandSubtitle}>{subtitle}</Text>
			</View>
		</LinearGradient>
	);
}
