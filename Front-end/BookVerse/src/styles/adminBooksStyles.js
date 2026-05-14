import { StyleSheet } from 'react-native';

export const adminBooksStyles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: '#f3f4f6',
	},
	content: {
		flex: 1,
	},
	filtersWrap: {
		paddingHorizontal: 12,
		paddingTop: 10,
		paddingBottom: 8,
		gap: 10,
	},
	searchContainer: {
		height: 44,
		borderRadius: 12,
		paddingHorizontal: 12,
		backgroundColor: '#ffffff',
		borderWidth: 1,
		borderColor: '#d1d5db',
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	searchInput: {
		flex: 1,
		fontSize: 14,
		color: '#111827',
	},
	filterScroll: {
		paddingRight: 12,
		gap: 8,
	},
	filterChip: {
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 999,
		backgroundColor: '#e5e7eb',
	},
	filterChipActive: {
		backgroundColor: '#0f172a',
	},
	filterChipText: {
		fontSize: 11,
		fontWeight: '800',
		color: '#475569',
	},
	filterChipTextActive: {
		color: '#fefce8',
	},
	metaRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		gap: 12,
	},
	metaTitle: {
		fontSize: 17,
		fontWeight: '900',
		color: '#111827',
	},
	metaSubtitle: {
		fontSize: 12,
		color: '#64748b',
	},
	contentArea: {
		flex: 1,
	},
	listContent: {
		paddingHorizontal: 8,
		paddingBottom: 16,
	},
	columnWrapper: {
		gap: 8,
		marginBottom: 8,
	},
	card: {
		flex: 1,
		maxWidth: '50%',
		backgroundColor: '#ffffff',
		borderRadius: 16,
		padding: 10,
		borderWidth: 1,
		borderColor: '#e5e7eb',
		shadowColor: '#000000',
		shadowOpacity: 0.08,
		shadowRadius: 10,
		shadowOffset: { width: 0, height: 6 },
		elevation: 3,
	},
	coverFrame: {
		width: '100%',
		height: 140,
		borderRadius: 12,
		overflow: 'hidden',
		backgroundColor: '#e5e7eb',
		alignItems: 'center',
		justifyContent: 'center',
	},
	cover: {
		width: '100%',
		height: '100%',
	},
	cardTitle: {
		marginTop: 10,
		fontSize: 13,
		fontWeight: '900',
		color: '#111827',
	},
	cardAuthor: {
		marginTop: 4,
		fontSize: 11,
		color: '#64748b',
		fontWeight: '700',
	},
	cardMeta: {
		marginTop: 8,
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 6,
	},
	cardMetaChip: {
		paddingHorizontal: 8,
		paddingVertical: 5,
		borderRadius: 999,
		backgroundColor: '#f8fafc',
		borderWidth: 1,
		borderColor: '#e5e7eb',
	},
	cardMetaChipText: {
		fontSize: 9,
		fontWeight: '800',
		color: '#475569',
	},
	cardActions: {
		marginTop: 10,
		flexDirection: 'row',
		gap: 6,
	},
	cardActionButton: {
		flex: 1,
		borderRadius: 10,
		paddingVertical: 8,
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'row',
		gap: 5,
	},
	editButton: {
		backgroundColor: 'rgba(13, 77, 77, 0.12)',
	},
	deleteButton: {
		backgroundColor: 'rgba(125, 31, 62, 0.12)',
	},
	cardActionText: {
		fontSize: 10,
		fontWeight: '800',
	},
	feedbackContainer: {
		marginTop: 40,
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 24,
	},
	feedbackText: {
		marginTop: 8,
		fontSize: 13,
		color: '#475569',
		textAlign: 'center',
	},
	errorText: {
		fontSize: 13,
		fontWeight: '800',
		color: '#9f1239',
		textAlign: 'center',
	},
});