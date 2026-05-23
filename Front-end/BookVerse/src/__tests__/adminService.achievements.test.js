jest.mock('axios', () => {
	const client = {
		get: jest.fn(async (url) => {
			if (url === '/api/v1/achievements') {
				return {
					data: {
						content: [
							{
								id: 11,
								nome: 'Leitor dedicado',
								descricao: 'Leia 5 livros',
								criteriaType: 'READ_BOOKS',
								targetValue: 5,
								ativo: true,
							},
						],
					},
				};
			}

			if (url === '/api/v1/achievements/progress') {
				return {
					data: [
						{
							achievementId: 11,
							label: 'Leitor dedicado',
							criteriaType: 'READ_BOOKS',
							currentValue: 3,
							targetValue: 5,
							completed: false,
						},
					],
				};
			}

			if (url === '/api/v1/achievements/aggregate') {
				return {
					data: [
						{
							achievementId: 11,
							label: 'Leitor dedicado',
							criteriaType: 'READ_BOOKS',
							usersMeetingCount: 18,
							totalUsers: 30,
							percentage: 60,
						},
					],
				};
			}

			return { data: null };
		}),
		post: jest.fn(async (url, payload) => {
			if (url === '/api/v1/achievements') {
				return {
					data: {
						id: 12,
						nome: payload.nome,
						descricao: payload.descricao,
						criteriaType: payload.criteriaType,
						targetValue: payload.targetValue,
						ativo: payload.ativo,
					},
				};
			}

			return { data: null };
		}),
		put: jest.fn(async (url, payload) => {
			const match = String(url).match(/\/api\/v1\/achievements\/(\d+)/);
			if (!match) {
				return { data: null };
			}

			return {
				data: {
					id: Number(match[1]),
					nome: payload.nome,
					descricao: payload.descricao,
					criteriaType: payload.criteriaType,
					targetValue: payload.targetValue,
					ativo: payload.ativo,
				},
			};
		}),
		delete: jest.fn(async () => ({ data: { success: true } })),
		interceptors: {
			request: { use: jest.fn() },
			response: { use: jest.fn() },
		},
	};

	return {
		__esModule: true,
		default: {
			create: jest.fn(() => client),
			post: jest.fn(),
		},
		create: jest.fn(() => client),
		post: jest.fn(),
	};
});

describe('adminService achievements workflows (mock mode)', () => {
	beforeEach(() => {
		jest.resetModules();
	});

	it('loads, creates, updates, and deletes achievements with progress data', async () => {
		const {
			getAchievements,
			getAchievementProgress,
			getAchievementsAggregate,
			createAchievement,
			updateAchievement,
			deleteAchievement,
		} = require('../services/adminService');

		const achievements = await getAchievements();
		expect(achievements).toHaveLength(1);
		expect(achievements[0]).toMatchObject({
			id: 11,
			name: 'Leitor dedicado',
			description: 'Leia 5 livros',
			criteriaType: 'READ_BOOKS',
			targetValue: 5,
			active: true,
		});

		const progress = await getAchievementProgress();
		expect(progress).toHaveLength(1);
		expect(progress[0]).toMatchObject({
			achievementId: 11,
			currentValue: 3,
			targetValue: 5,
			completed: false,
		});

		const aggregate = await getAchievementsAggregate();
		expect(aggregate).toHaveLength(1);
		expect(aggregate[0]).toMatchObject({
			achievementId: 11,
			usersMeetingCount: 18,
			totalUsers: 30,
			percentage: 60,
		});

		const created = await createAchievement({
			name: 'Crítico ativo',
			description: 'Faça 5 avaliações',
			criteriaType: 'RATINGS_CREATED',
			targetValue: 5,
			active: false,
		});
		expect(created).toMatchObject({
			id: 12,
			name: 'Crítico ativo',
			description: 'Faça 5 avaliações',
			criteriaType: 'RATINGS_CREATED',
			targetValue: 5,
			active: false,
		});

		const updated = await updateAchievement(11, {
			name: 'Leitor dedicado 2',
			description: 'Leia 10 livros',
			criteriaType: 'READ_BOOKS',
			targetValue: 10,
			active: true,
		});
		expect(updated).toMatchObject({
			id: 11,
			name: 'Leitor dedicado 2',
			description: 'Leia 10 livros',
			targetValue: 10,
			active: true,
		});

		const removed = await deleteAchievement(11);
		expect(removed).toEqual({ success: true });
	});
});