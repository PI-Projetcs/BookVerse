import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: '#0b1f2a',
	},
	container: {
		flex: 1,
		backgroundColor: '#f3f4f6',
	},
	content: {
		padding: 12,
		paddingBottom: 18,
	},
	card: {
		marginTop: 12,
		padding: 14,
		borderRadius: 14,
		backgroundColor: '#ffffff',
		borderWidth: 1,
		borderColor: '#e5e7eb',
	},
	title: {
		fontSize: 16,
		fontWeight: '900',
		color: '#111827',
	},
	subtitle: {
		marginTop: 6,
		fontSize: 12,
		fontWeight: '700',
		color: '#64748b',
		lineHeight: 16,
	},
	row: {
		marginTop: 12,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 10,
	},
	chip: {
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 999,
		backgroundColor: '#fefce8',
		borderWidth: 2,
		borderColor: '#eab308',
	},
	chipText: {
		fontSize: 11,
		fontWeight: '900',
		color: '#0f172a',
	},
	button: {
		marginTop: 10,
		paddingVertical: 12,
		borderRadius: 12,
		backgroundColor: '#0f172a',
		alignItems: 'center',
	},
	buttonText: {
		color: '#fef3c7',
		fontSize: 12,
		fontWeight: '900',
	},
});

export default styles;

