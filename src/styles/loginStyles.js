import { StyleSheet } from 'react-native';

export const loginStyles = StyleSheet.create({
	flex: {
		flex: 1,
	},
	safeArea: {
		flex: 1,
		backgroundColor: '#111827',
	},
	phoneFrame: {
		flex: 1,
		backgroundColor: '#f3f4f6',
	},
	content: {
		paddingHorizontal: 20,
		paddingTop: 24,
		paddingBottom: 32,
	},
	tabsContainer: {
		flexDirection: 'row',
		borderRadius: 10,
		backgroundColor: '#f3f4f6',
		marginBottom: 20,
		padding: 4,
	},
	tabButton: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 10,
		borderRadius: 8,
	},
	tabButtonActive: {
		backgroundColor: '#ffffff',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.08,
		shadowRadius: 3,
		elevation: 1,
	},
	tabText: {
		color: '#4b5563',
		fontWeight: '700',
	},
	tabTextActive: {
		color: '#111827',
	},
	form: {
		gap: 12,
	},
	label: {
		fontWeight: '700',
		color: '#111827',
		fontSize: 14,
		marginBottom: 6,
	},
	inputWrapper: {
		borderWidth: 2,
		borderColor: '#d1d5db',
		borderRadius: 10,
		backgroundColor: '#ffffff',
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 10,
		height: 46,
	},
	inputIcon: {
		marginRight: 8,
	},
	input: {
		flex: 1,
		color: '#111827',
		fontSize: 14,
	},
	buttonTouch: {
		marginTop: 12,
		borderRadius: 10,
		overflow: 'hidden',
	},
	primaryButton: {
		borderRadius: 10,
		paddingVertical: 13,
		alignItems: 'center',
	},
	secondaryButton: {
		borderRadius: 10,
		paddingVertical: 13,
		alignItems: 'center',
	},
	primaryButtonText: {
		color: '#fefce8',
		fontWeight: '800',
		fontSize: 15,
	},
	infoBox: {
		marginTop: 16,
		borderRadius: 10,
		borderWidth: 2,
		borderColor: '#fcd34d',
		backgroundColor: '#fffbeb',
		padding: 12,
		gap: 4,
	},
	infoTitle: {
		color: '#92400e',
		fontWeight: '800',
		fontSize: 12,
	},
	infoText: {
		color: '#92400e',
		fontSize: 12,
	},
});