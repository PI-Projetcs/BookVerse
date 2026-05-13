import { StyleSheet } from 'react-native';

export const FOOTER_GRADIENT_COLORS = ['#6B0F2E', '#0a0f1a', '#003D2B'];

export const footerStyles = StyleSheet.create({
	wrapper: {
		flexDirection: 'row',
		borderTopWidth: 2,
		borderTopColor: '#B8941F',
		paddingTop: 7,
		paddingBottom: 8,
		paddingHorizontal: 6,
		gap: 4,
		shadowColor: '#000000',
		shadowOffset: { width: 0, height: -8 },
		shadowOpacity: 0.35,
		shadowRadius: 16,
		elevation: 14,
	},
	item: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		gap: 2,
		paddingVertical: 6,
		borderRadius: 10,
	},
	itemActive: {
		backgroundColor: 'rgba(180, 83, 9, 0.45)',
		borderWidth: 1,
		borderColor: 'rgba(250, 204, 21, 0.5)',
		marginHorizontal: 9,
		paddingVertical: 3,
	},
	label: {
		fontSize: 10,
		fontWeight: '700',
		color: '#d1d5db',
	},
	labelActive: {
		color: '#fde68a',
	},
});