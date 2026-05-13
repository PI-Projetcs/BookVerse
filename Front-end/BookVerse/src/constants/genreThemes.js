export const GENRE_CHIP_STYLES = {
	romance: {
		backgroundColor: '#F3E8FF',
		borderColor: '#59168B',
		textColor: '#59168B',
	},
	fantasia: {
		backgroundColor: '#E0E7FF',
		borderColor: '#A3B3FF',
		textColor: '#312C85',
	},
	'ficcao cientifica': {
		backgroundColor: '#FFEDDE',
		borderColor: '#FFB86A',
		textColor: '#7E2A0C',
	},
	terror: {
		backgroundColor: '#FFE5E5',
		borderColor: '#FF4444',
		textColor: '#8B0000',
	},
	suspense: {
		backgroundColor: '#F3E5E5',
		borderColor: '#A64253',
		textColor: '#5C1E2D',
	},
	aventura: {
		backgroundColor: '#FEF3C7',
		borderColor: '#FBBF24',
		textColor: '#92400E',
	},
	drama: {
		backgroundColor: '#E5E7EB',
		borderColor: '#9CA3AF',
		textColor: '#374151',
	},
	poesia: {
		backgroundColor: '#E3E8D8',
		borderColor: '#7A8E5F',
		textColor: '#4A5F42',
	},
	biografia: {
		backgroundColor: '#CBFBF1',
		borderColor: '#46ECD5',
		textColor: '#0B4F4A',
	},
	historia: {
		backgroundColor: '#E9D5C9',
		borderColor: '#8B5A3C',
		textColor: '#5A2F1F',
	},
	autoajuda: {
		backgroundColor: '#CFF7DE',
		borderColor: '#4ADE80',
		textColor: '#166534',
	},
	infantojuvenil: {
		backgroundColor: '#DBEAFE',
		borderColor: '#60A5FA',
		textColor: '#1D4ED8',
	},
};

export const RATING_ICON_COLOR = '#FFB900';

export function normalizeGenreKey(genreLabel) {
	return String(genreLabel || '')
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/\//g, ' ')
		.replace(/[^a-z0-9\s]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}
