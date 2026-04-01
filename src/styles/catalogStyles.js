import { StyleSheet } from 'react-native';

export const catalogStyles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: '#0b1f2a',
	},
	container: {
		flex: 1,
		backgroundColor: '#f3f4f6',
	},
	contentArea: {
		flex: 1,
	},
	searchContainer: {
		marginHorizontal: 12,
		marginTop: 8,
		borderRadius: 10,
		paddingHorizontal: 12,
		height: 42,
		backgroundColor: '#fefce8',
		borderWidth: 2,
		borderColor: '#eab308',
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	searchInput: {
		flex: 1,
		color: '#0f172a',
		fontSize: 14,
	},
	metaRow: {
		marginTop: 10,
		marginHorizontal: 12,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 8,
	},
	totalBooks: {
		fontSize: 20,
		fontWeight: '800',
		color: '#0f172a',
	},
	sortRow: {
		flexDirection: 'row',
		gap: 6,
	},
	sortChip: {
		paddingHorizontal: 9,
		paddingVertical: 6,
		borderRadius: 8,
		backgroundColor: '#e2e8f0',
	},
	sortChipActive: {
		backgroundColor: '#0f172a',
	},
	sortChipText: {
		fontSize: 11,
		fontWeight: '700',
		color: '#334155',
	},
	sortChipTextActive: {
		color: '#f8fafc',
	},
	listContent: {
		paddingHorizontal: 8,
		paddingVertical: 10,
		paddingBottom: 16,
	},
	columnWrapper: {
		gap: 8,
		marginBottom: 8,
	},
	feedbackContainer: {
		marginTop: 32,
		alignItems: 'center',
		justifyContent: 'center',
	},
	feedbackText: {
		marginTop: 8,
		fontSize: 14,
		color: '#334155',
	},
	errorText: {
		marginHorizontal: 16,
		textAlign: 'center',
		fontSize: 14,
		color: '#b91c1c',
		fontWeight: '700',
	},
});