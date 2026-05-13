import { StyleSheet } from 'react-native';

export const HOME_HEADER_GRADIENT = ['#0b0f19', '#6B0F2E', '#0F172B'];
export const HOME_PROGRESS_GRADIENT = ['#7D1F3E', '#5A1528'];
export const HOME_CHAPTER_DONE_GRADIENT = ['#6B7C59', '#4A5840'];
export const HOME_CHAPTER_ACTIVE_GRADIENT = ['#D4AF37', '#B8941F'];

export const homeStyles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: '#0b1f2a',
	},
	header: {
		borderBottomWidth: 2,
		borderBottomColor: '#B8941F',
	},
	headerRow: {
		paddingHorizontal: 16,
		paddingVertical: 14,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 10,
		backgroundColor: 'rgba(0,0,0,0.10)',
	},
	headerTitle: {
		color: '#fefce8',
		fontSize: 18,
		fontWeight: '800',
		letterSpacing: 0.3,
	},
	headerTitleRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	headerChip: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 999,
		backgroundColor: 'rgba(15, 23, 42, 0.55)',
		borderWidth: 1,
		borderColor: 'rgba(250, 204, 21, 0.35)',
	},
	headerChipText: {
		color: '#fef3c7',
		fontSize: 11,
		fontWeight: '700',
	},
	container: {
		flex: 1,
		backgroundColor: '#f3f4f6',
	},
	content: {
		padding: 12,
		paddingBottom: 18,
	},
	sectionHeader: {
		marginTop: 4,
		marginBottom: 10,
	},
	sectionTitle: {
		fontSize: 14,
		fontWeight: '900',
		color: '#111827',
	},
	bookCard: {
		flexDirection: 'row',
		gap: 12,
		padding: 12,
		borderRadius: 14,
		backgroundColor: '#ffffff',
		borderWidth: 1,
		borderColor: '#e5e7eb',
		shadowColor: '#000',
		shadowOpacity: 0.08,
		shadowRadius: 12,
		shadowOffset: { width: 0, height: 6 },
		elevation: 3,
	},
	bookCover: {
		width: 74,
		height: 96,
		borderRadius: 10,
		backgroundColor: '#e5e7eb',
	},
	bookInfo: {
		flex: 1,
	},
	bookTitle: {
		fontSize: 14,
		fontWeight: '900',
		color: '#0f172a',
	},
	bookAuthor: {
		marginTop: 2,
		fontSize: 12,
		fontWeight: '700',
		color: '#64748b',
	},
	bookDesc: {
		marginTop: 6,
		fontSize: 11,
		lineHeight: 15,
		color: '#334155',
	},
	bookMetaRow: {
		marginTop: 10,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 14,
	},
	bookMetaItem: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	bookMetaText: {
		fontSize: 10,
		fontWeight: '700',
		color: '#64748b',
	},
	card: {
		marginTop: 12,
		padding: 12,
		borderRadius: 14,
		backgroundColor: '#ffffff',
		borderWidth: 1,
		borderColor: '#e5e7eb',
	},
	cardHeaderRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 10,
		marginBottom: 10,
	},
	cardTitle: {
		fontSize: 13,
		fontWeight: '900',
		color: '#111827',
	},
	cardAction: {
		fontSize: 11,
		fontWeight: '900',
		color: '#6B7C59',
	},
	progressBlock: {
		marginTop: 6,
	},
	progressBlockTight: {
		marginTop: 10,
	},
	progressTopRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 10,
	},
	progressLabel: {
		fontSize: 11,
		fontWeight: '800',
		color: '#334155',
	},
	progressValue: {
		fontSize: 11,
		fontWeight: '900',
		color: '#111827',
	},
	progressTrack: {
		marginTop: 6,
		height: 8,
		borderRadius: 999,
		backgroundColor: '#e5e7eb',
		overflow: 'hidden',
	},
	progressFill: {
		height: '100%',
		borderRadius: 999,
		backgroundColor: '#7D1F3E',
	},
	progressTrackMuted: {
		marginTop: 6,
		height: 8,
		borderRadius: 999,
		backgroundColor: '#e5e7eb',
		overflow: 'hidden',
	},
	progressFillMuted: {
		height: '100%',
		borderRadius: 999,
		backgroundColor: '#111827',
	},
	linkRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	linkText: {
		fontSize: 11,
		fontWeight: '900',
		color: '#7D1F3E',
	},
	chapterList: {
		gap: 8,
	},
	chapterRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
		paddingVertical: 10,
		paddingHorizontal: 10,
		borderRadius: 12,
		backgroundColor: '#f8fafc',
		borderWidth: 1,
		borderColor: '#e5e7eb',
	},
	chapterRowDone: {
		backgroundColor: 'rgba(107, 124, 89, 0.12)',
		borderColor: '#6B7C59',
	},
	chapterRowActive: {
		backgroundColor: 'rgba(184, 148, 31, 0.12)',
		borderColor: '#B8941F',
	},
	chapterRowLocked: {
		backgroundColor: '#f9fafb',
	},
	chapterBadge: {
		width: 26,
		height: 26,
		borderRadius: 999,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#111827',
	},
	chapterBadgeActive: {
		backgroundColor: '#f59e0b',
	},
	chapterBadgeLocked: {
		backgroundColor: '#e5e7eb',
	},
	chapterBadgeText: {
		color: '#ffffff',
		fontSize: 12,
		fontWeight: '900',
	},
	chapterBadgeTextLocked: {
		color: '#6b7280',
	},
	chapterTextCol: {
		flex: 1,
	},
	chapterTitle: {
		fontSize: 12,
		fontWeight: '900',
		color: '#111827',
	},
	chapterTitleLocked: {
		color: '#6b7280',
	},
	chapterStatus: {
		marginTop: 2,
		fontSize: 10,
		fontWeight: '800',
		color: '#64748b',
	},
	chapterStatusLocked: {
		color: '#9ca3af',
	},
	highlightCard: {
		marginTop: 10,
		padding: 12,
		borderRadius: 14,
		backgroundColor: '#fffbeb',
		borderWidth: 1,
		borderColor: '#B8941F',
	},
	highlightIcon: {
		marginBottom: 6,
	},
	highlightQuote: {
		fontSize: 12,
		lineHeight: 17,
		fontWeight: '800',
		color: '#111827',
	},
	highlightBottomRow: {
		marginTop: 10,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 12,
	},
	highlightAuthor: {
		fontSize: 10,
		fontWeight: '900',
		color: '#6b7280',
	},
	likesRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	likesText: {
		fontSize: 10,
		fontWeight: '900',
		color: '#7D1F3E',
	},
	bottomSpacer: {
		height: 8,
	},
	modalBackdrop: {
		flex: 1,
		backgroundColor: 'rgba(15, 23, 42, 0.55)',
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 16,
	},
	modalCard: {
		width: '100%',
		maxWidth: 420,
		borderRadius: 16,
		padding: 14,
		backgroundColor: '#ffffff',
		borderWidth: 1,
		borderColor: '#e5e7eb',
	},
	modalTitle: {
		fontSize: 14,
		fontWeight: '900',
		color: '#111827',
	},
	modalGrid: {
		marginTop: 12,
		gap: 10,
	},
	modalField: {
		gap: 6,
	},
	modalLabel: {
		fontSize: 11,
		fontWeight: '900',
		color: '#334155',
	},
	modalInput: {
		height: 42,
		borderRadius: 12,
		paddingHorizontal: 12,
		backgroundColor: '#f8fafc',
		borderWidth: 1,
		borderColor: '#e5e7eb',
		color: '#0f172a',
		fontWeight: '800',
	},
	modalActions: {
		marginTop: 14,
		flexDirection: 'row',
		gap: 10,
	},
	modalButton: {
		flex: 1,
		height: 44,
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
	},
	modalButtonPrimary: {
		backgroundColor: '#0f172a',
	},
	modalButtonGhost: {
		backgroundColor: '#f1f5f9',
		borderWidth: 1,
		borderColor: '#e2e8f0',
	},
	modalButtonText: {
		fontSize: 12,
		fontWeight: '900',
		color: '#fef3c7',
	},
	modalButtonTextGhost: {
		color: '#0f172a',
	},
});

