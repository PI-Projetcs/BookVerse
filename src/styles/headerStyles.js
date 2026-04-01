import { StyleSheet } from 'react-native';

export const HEADER_GRADIENT_COLORS = ['#881337', '#0f172a', '#064e3b'];

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