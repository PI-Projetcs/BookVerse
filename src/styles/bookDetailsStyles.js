import { StyleSheet } from 'react-native';

export const bookDetailsStyles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: '#0b1f2a',
	},
	header: {
		borderBottomWidth: 3,
		borderBottomColor: 'rgba(202, 138, 4, 0.75)',
	},
	headerOverlay: {
		paddingHorizontal: 14,
		paddingVertical: 12,
		backgroundColor: 'rgba(0, 0, 0, 0.1)',
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
	},
	backButton: {
		width: 34,
		height: 34,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: 'rgba(250, 204, 21, 0.65)',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.22)',
	},
	headerTitle: {
		fontSize: 16,
		fontWeight: '800',
		color: '#fefce8',
	},
	content: {
		paddingBottom: 24,
		backgroundColor: '#f3f4f6',
	},
	contentInner: {
		paddingHorizontal: 12,
		paddingTop: 10,
	},
	bodyArea: {
		flex: 1,
		backgroundColor: '#f3f4f6',
	},
	topCard: {
		borderRadius: 0,
		paddingHorizontal: 14,
		paddingTop: 14,
		paddingBottom: 18,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
		marginBottom: 14,
	},
	cover: {
		width: 108,
		height: 162,
		borderRadius: 10,
		borderWidth: 1,
		borderColor: '#c89a04',
		backgroundColor: '#334155',
	},
	topInfo: {
		flex: 1,
		justifyContent: 'center',
		gap: 6,
	},
	title: {
		fontSize: 21,
		fontWeight: '800',
		color: '#fefce8',
	},
	author: {
		fontSize: 14,
		color: '#fef3c7',
	},
	metaChip: {
		alignSelf: 'flex-start',
		paddingHorizontal: 7,
		paddingVertical: 3,
		backgroundColor: '#fde68a',
		borderWidth: 1,
		borderRadius: 5,
	},
	metaChipText: {
		fontSize: 11,
		fontWeight: '700',
		color: '#78350f',
	},
	metaRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	metaText: {
		fontSize: 12,
		color: '#FEF3C6',
	},
	ratingRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	ratingText: {
		fontSize: 15,
		fontWeight: '800',
		color: '#fef3c7',
	},
	ratingCountText: {
		fontSize: 12,
		fontWeight: '600',
		color: '#fef3c7',
	},
	sectionCard: {
		backgroundColor: '#ffffff',
		borderRadius: 10,
		padding: 12,
		marginBottom: 10,
		borderWidth: 1,
		borderColor: '#e5e7eb',
	},
	synopsisCardOverlap: {
		marginTop: -28,
		zIndex: 2,
		elevation: 3,
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: '800',
		color: '#0f172a',
		marginBottom: 8,
	},
	sectionHeaderRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		marginBottom: 8,
	},
	sectionText: {
		fontSize: 14,
		lineHeight: 20,
		color: '#334155',
	},
	commentsList: {
		gap: 10,
	},
	commentItem: {
		paddingTop: 8,
		borderTopWidth: 1,
		borderTopColor: '#f1f5f9',
	},
	commentTopRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 4,
	},
	commentAuthorRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		flex: 1,
	},
	commentAuthor: {
		fontSize: 13,
		fontWeight: '700',
		color: '#0f172a',
	},
	commentStarsRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	commentStarIconWrapper: {
		position: 'relative',
		width: 12,
		height: 12,
	},
	commentStarsText: {
		fontSize: 12,
		fontWeight: '700',
		color: '#92400e',
	},
	commentChapter: {
		fontSize: 11,
		color: '#64748b',
		marginBottom: 4,
	},
	commentText: {
		fontSize: 13,
		lineHeight: 18,
		color: '#334155',
	},
	commentsEmptyText: {
		fontSize: 13,
		color: '#64748b',
	},
	centeredContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#f3f4f6',
		paddingHorizontal: 20,
	},
	feedbackText: {
		marginTop: 8,
		fontSize: 14,
		color: '#334155',
	},
	errorText: {
		fontSize: 14,
		fontWeight: '700',
		color: '#7D1F3E',
		textAlign: 'center',
	},
});