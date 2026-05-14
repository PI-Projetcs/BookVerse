import { StyleSheet } from 'react-native';

export const bookCardStyles = StyleSheet.create({
	card: {
		flex: 1,
		minWidth: 0,
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
	coverFrame: {
		width: '100%',
		height: 140,
		backgroundColor: '#e5e7eb',
		alignItems: 'center',
		justifyContent: 'center',
	},
	cover: {
		width: '100%',
		height: '100%',
	},
	content: {
		paddingHorizontal: 6,
		paddingVertical: 6,
		gap: 3,
	},
	year: {
		fontSize: 10,
		color: '#0f172a',
		fontWeight: '800',
	},
	title: {
		fontSize: 12,
		fontWeight: '700',
		color: '#0f172a',
		minHeight: 30,
	},
	author: {
		fontSize: 10,
		color: '#475569',
	},
	footerRow: {
		marginTop: 4,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		gap: 4,
	},
	genreChip: {
		maxWidth: '68%',
		paddingHorizontal: 5,
		paddingVertical: 2,
		borderRadius: 4,
		backgroundColor: '#fff7ed',
		borderWidth: 1,
		borderColor: '#fed7aa',
	},
	genreChipSpacer: {
		flex: 1,
	},
	genreText: {
		fontSize: 8,
		fontWeight: '700',
		color: '#9a3412',
	},
	ratingRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 2,
	},
	ratingText: {
		fontSize: 10,
		fontWeight: '800',
		color: '#0f172a',
	},
});