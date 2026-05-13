import { MOCK_BOOKS } from './booksMock';

export const MOCK_ADMIN_BOOKS = MOCK_BOOKS.slice(0, 6).map((book) => ({
	...book,
	status: 'published',
}));