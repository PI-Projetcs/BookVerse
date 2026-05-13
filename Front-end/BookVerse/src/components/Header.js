import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { HEADER_GRADIENT_COLORS, headerStyles } from '../styles/headerStyles';

export default function Header({
	title = 'BookVerse',
	subtitle = 'Seu clube do livro digital',
	colors = HEADER_GRADIENT_COLORS,
	onRightAction,
	rightActionLabel = 'Sair',
	rightActionIcon = 'log-out-outline',
}) {
	const insets = useSafeAreaInsets();
	const horizontalInset = Math.max(insets.left, insets.right, 0);

	return (
		<LinearGradient
			colors={colors}
			start={{ x: 0, y: 0 }}
			end={{ x: 1, y: 0 }}
			style={headerStyles.container}
		>
			<View
				style={[
					headerStyles.overlay,
					{ paddingTop: 32 + insets.top, paddingHorizontal: 14 + horizontalInset },
				]}
			>
				{typeof onRightAction === 'function' ? (
					<TouchableOpacity
						style={[headerStyles.rightActionButton, { top: insets.top + 10 }]}
						onPress={onRightAction}
						activeOpacity={0.85}
						hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
						accessibilityRole="button"
						accessibilityLabel={rightActionLabel}
					>
						<Ionicons name={rightActionIcon} size={16} color="#fefce8" />
						<Text style={headerStyles.rightActionText}>{rightActionLabel}</Text>
					</TouchableOpacity>
				) : null}
				<View style={headerStyles.brandRow}>
					<MaterialCommunityIcons name="book-open-page-variant" size={32} color="#facc15" />
					<Text style={headerStyles.brandTitle}>{title}</Text>
				</View>
				<Text style={headerStyles.brandSubtitle}>{subtitle}</Text>
			</View>
		</LinearGradient>
	);
}
