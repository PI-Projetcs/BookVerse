import { StyleSheet } from 'react-native';

export const HEADER_GRADIENT_COLORS = ['#6B0F2E', '#0a0f1a', '#003D2B'];

export const headerStyles = StyleSheet.create({
	container: {
		borderBottomWidth: 3,
		borderBottomColor: 'rgba(202, 138, 4, 0.75)',
	},
	overlay: {
		paddingVertical: 24,
		paddingHorizontal: 18,
		backgroundColor: 'rgba(0, 0, 0, 0.1)',
	},
	rightActionButton: {
		position: 'absolute',
		top: 12,
		right: 14,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 999,
		borderWidth: 1,
		borderColor: 'rgba(250, 204, 21, 0.45)',
		backgroundColor: 'rgba(0, 0, 0, 0.18)',
	},
	rightActionText: {
		color: '#fefce8',
		fontSize: 11,
		fontWeight: '800',
	},
	brandRow: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		gap: 8,
		marginBottom: 6,
	},
	brandTitle: {
		color: '#fefce8',
		fontSize: 30,
		fontWeight: '800',
		letterSpacing: 0.6,
	},
	brandSubtitle: {
		color: 'rgba(253, 230, 138, 0.85)',
		textAlign: 'center',
		fontSize: 12,
	},
});