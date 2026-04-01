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
		padding: 12,
		paddingBottom: 24,
		backgroundColor: '#f3f4f6',
	},
	bodyArea: {
		flex: 1,
		backgroundColor: '#f3f4f6',
	},
	topCard: {
		backgroundColor: '#065f46',
		borderRadius: 14,
		padding: 12,
		flexDirection: 'row',
		gap: 12,
		marginBottom: 12,
	},
	cover: {
		width: 122,
		height: 182,
		borderRadius: 10,
		backgroundColor: '#334155',
	},
	topInfo: {
		flex: 1,
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
		borderRadius: 5,
	},
	metaChipText: {
		fontSize: 11,
		fontWeight: '700',
		color: '#78350f',
	},
	metaText: {
		fontSize: 12,
		color: '#f8fafc',
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
	sectionCard: {
		backgroundColor: '#ffffff',
		borderRadius: 10,
		padding: 12,
		marginBottom: 10,
		borderWidth: 1,
		borderColor: '#e5e7eb',
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: '800',
		color: '#0f172a',
		marginBottom: 8,
	},
	sectionText: {
		fontSize: 14,
		lineHeight: 20,
		color: '#334155',
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
		color: '#b91c1c',
		textAlign: 'center',
	},
});