import React from 'react';
import renderer from 'react-test-renderer';
import { Alert } from 'react-native';
import BookDetailsScreen from '../screens/BookDetails/BookDetailsScreen';

const mockGetBookById = jest.fn();
const mockGetBookRatings = jest.fn();
const mockGetDiscussions = jest.fn();
const mockRateBook = jest.fn();
const mockUpdateBookRating = jest.fn();
const mockDeleteBookRating = jest.fn();
const mockGetUserFavorites = jest.fn();
const mockAddFavoriteBook = jest.fn();
const mockRemoveFavoriteBook = jest.fn();

jest.mock('../components/FooterNav', () => {
	const React = require('react');
	return function FooterNavMock() {
		return React.createElement('FooterNav', null);
	};
});

jest.mock('../services/bookService', () => ({
	getBookById: (...args) => mockGetBookById(...args),
	getBookRatings: (...args) => mockGetBookRatings(...args),
	getDiscussions: (...args) => mockGetDiscussions(...args),
	rateBook: (...args) => mockRateBook(...args),
	updateBookRating: (...args) => mockUpdateBookRating(...args),
	deleteBookRating: (...args) => mockDeleteBookRating(...args),
}));

jest.mock('../services/profileService', () => ({
	addFavoriteBook: (...args) => mockAddFavoriteBook(...args),
	getUserFavorites: (...args) => mockGetUserFavorites(...args),
	removeFavoriteBook: (...args) => mockRemoveFavoriteBook(...args),
}));

jest.mock('../context/AuthContext', () => ({
	useAuth: () => ({
		session: { id: 42, token: 'token', role: 'member', email: 'reader@example.com' },
		isAuthenticated: true,
	}),
}));

const navigation = {
	goBack: jest.fn(),
	navigate: jest.fn(),
	getState: () => ({ routeNames: ['Home', 'Catalog', 'Discussion', 'Profile'] }),
};

const book = {
	id: 10,
	title: 'O Nome do Livro',
	author: 'Autor Exemplo',
	genre: 'Fantasia',
	year: '2024',
	synopsis: 'Uma sinopse envolvente.',
	authorBio: 'Biografia do autor.',
	coverUrl: 'https://example.com/cover.jpg',
	rating: 4.5,
};

const ratings = [
	{
		id: 1,
		bookId: 10,
		userId: 42,
		rating: 5,
		review: 'Leitura excelente',
		author: 'Você',
		status: 'APPROVED',
		date: '2026-05-20T10:00:00Z',
	},
	{
		id: 2,
		bookId: 10,
		userId: 7,
		rating: 4,
		review: 'Gostei bastante',
		author: 'Ana',
		status: 'APPROVED',
		date: '2026-05-21T10:00:00Z',
	},
	{
		id: 3,
		bookId: 10,
		userId: 8,
		rating: 2,
		review: 'Ainda estou lendo',
		author: 'Bruno',
		status: 'PENDING',
		date: '2026-05-22T10:00:00Z',
	},
];

const discussions = [
	{
		title: 'Capítulo 1',
		comments: [
			{ id: 11, author: 'Lia', text: 'Muito bom', likes: 3 },
			{ id: 12, author: 'Rui', text: 'Concordo', likes: 6 },
		],
	},
];

const flushPromises = () => new Promise((resolve) => setImmediate(resolve));

describe('BookDetailsScreen', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		jest.spyOn(Alert, 'alert').mockImplementation(() => {});
		mockGetBookById.mockResolvedValue(book);
		mockGetBookRatings.mockResolvedValue({ items: ratings });
		mockGetDiscussions.mockResolvedValue(discussions);
		mockGetUserFavorites.mockResolvedValue([]);
		mockRateBook.mockResolvedValue({ item: { id: 99 } });
		mockUpdateBookRating.mockResolvedValue({ item: { id: 1 } });
		mockDeleteBookRating.mockResolvedValue(undefined);
		mockAddFavoriteBook.mockResolvedValue(undefined);
		mockRemoveFavoriteBook.mockResolvedValue(undefined);
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('loads book data, shows rating summary and renders featured reviews', async () => {
		let tree;
		await renderer.act(async () => {
			tree = renderer.create(<BookDetailsScreen navigation={navigation} route={{ params: { id: 10 } }} />);
			await flushPromises();
		});

		expect(mockGetBookById).toHaveBeenCalledWith(10);
		expect(mockGetBookRatings).toHaveBeenCalledWith(10);
		expect(mockGetDiscussions).toHaveBeenCalledWith(10);
		expect(mockGetUserFavorites).toHaveBeenCalledTimes(1);
		expect(tree.root.findAllByType('Text').some((node) => node.props.children === 'O Nome do Livro')).toBe(true);
		expect(tree.root.findAllByType('Text').some((node) => node.props.children === '4.5')).toBe(true);
		expect(tree.root.findAllByType('Text').some((node) => node.props.children === 'Leitura excelente')).toBe(true);
		expect(tree.root.findAllByType('Text').some((node) => node.props.children === 'Gostei bastante')).toBe(true);
		expect(tree.root.findAllByType('Text').some((node) => node.props.children === 'Avaliações da comunidade')).toBe(true);
		expect(tree.root.findAllByType('Text').some((node) => node.props.children === 'Sua avaliação')).toBe(true);
	});

	it('saves a new rating from the composer and refreshes the screen', async () => {
		let tree;
		await renderer.act(async () => {
			tree = renderer.create(<BookDetailsScreen navigation={navigation} route={{ params: { id: 10 } }} />);
			await flushPromises();
		});

		const starButton = tree.root
			.findAllByType('TouchableOpacity')
			.find((node) => node.props.accessibilityLabel === 'Selecionar 5 estrelas');
		expect(starButton).toBeTruthy();

		await renderer.act(async () => {
			starButton.props.onPress();
		});

		const reviewInput = tree.root.findAllByType('TextInput').find((node) => node.props.accessibilityLabel === 'Comentário da sua avaliação');
		await renderer.act(async () => {
			reviewInput.props.onChangeText('Recomendação forte para outros leitores');
		});

		const saveButton = tree.root
			.findAllByType('TouchableOpacity')
			.find((node) => node.props.accessibilityLabel === 'Atualizar avaliação');

		await renderer.act(async () => {
			await saveButton.props.onPress();
			await flushPromises();
		});

		expect(mockUpdateBookRating).toHaveBeenCalledWith(10, 5, 'Recomendação forte para outros leitores');
		expect(Alert.alert).toHaveBeenCalledWith('Sucesso', 'Sua avaliação foi atualizada e está pendente de aprovação.');
		expect(mockGetBookRatings).toHaveBeenCalledTimes(2);
	});

	it('matches the loaded interface snapshot', async () => {
		let tree;
		await renderer.act(async () => {
			tree = renderer.create(<BookDetailsScreen navigation={navigation} route={{ params: { id: 10 } }} />);
			await flushPromises();
		});

		expect(tree.toJSON()).toMatchSnapshot();
	});
});