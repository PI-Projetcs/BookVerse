import { StyleSheet } from 'react-native';

export const bookCardStyles = StyleSheet.create({
	card: {
		flex: 1,
		backgroundColor: '#ffffff',
		borderRadius: 10,
		overflow: 'hidden',
		borderWidth: 1,
		borderColor: '#e5e7eb',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.08,
		shadowRadius: 6,
		elevation: 2,
	},
	cover: {
		width: '100%',
		height: 178,
		backgroundColor: '#e5e7eb',
	},
	content: {
		paddingHorizontal: 8,
		paddingVertical: 8,
		gap: 4,
	},
	year: {
		fontSize: 11,
		color: '#0f172a',
		fontWeight: '800',
	},
	title: {
		fontSize: 13,
		fontWeight: '700',
		color: '#0f172a',
		minHeight: 34,
	},
	author: {
		fontSize: 11,
		color: '#475569',
	},
	footerRow: {
		marginTop: 4,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	genreChip: {
		maxWidth: '65%',
		paddingHorizontal: 6,
		paddingVertical: 2,
		borderRadius: 4,
		backgroundColor: '#fff7ed',
		borderWidth: 1,
		borderColor: '#fed7aa',
	},
	genreText: {
		fontSize: 9,
		fontWeight: '700',
		color: '#9a3412',
	},
	ratingRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 3,
	},
	ratingText: {
		fontSize: 11,
		fontWeight: '800',
		color: '#0f172a',
	},
});