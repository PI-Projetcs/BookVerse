import axios from 'axios';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export async function getCatalogBooks({ query = '', sortBy = 'title' } = {}) {
	const response = await axios.get(`${BASE_URL}/books`, {
		params: {
			q: query,
			sort: sortBy,
		},
	});

	if (Array.isArray(response.data)) {
		return response.data;
	}

	if (Array.isArray(response.data?.items)) {
		return response.data.items;
	}

	return [];
}

export async function getBookById(bookId) {
	const response = await axios.get(`${BASE_URL}/books/${bookId}`);

	if (response.data?.item) {
		return response.data.item;
	}

	return response.data;
}
