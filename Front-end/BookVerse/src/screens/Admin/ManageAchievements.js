import React, { useEffect, useMemo, useState } from 'react';
import {
	ActivityIndicator,
	Alert,
	ScrollView,
	StatusBar,
	Switch,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FooterNav from '../../components/FooterNav';
import Header from '../../components/Header';
import { ADMIN_FOOTER_ITEMS } from '../../constants/adminFooterItems';
import {
	createAchievement,
	deleteAchievement,
	getAchievementProgress,
	getAchievements,
    getAchievementsAggregate,
	updateAchievement,
} from '../../services/adminService';
import { adminAchievementsStyles as styles } from '../../styles/adminAchievementsStyles';

const DEFAULT_FORM = {
	id: null,
	name: '',
	description: '',
	selectedCriteria: ['READ_BOOKS'],
	criteriaTargets: {
		READ_BOOKS: '1',
		RATINGS_CREATED: '1',
		FAVORITES_ADDED: '1',
	},
	active: true,
};

const CRITERIA_OPTIONS = [
	{
		key: 'READ_BOOKS',
		label: 'Livros lidos',
		description: 'Baseada na quantidade de livros concluídos pelo usuário.',
	},
	{
		key: 'RATINGS_CREATED',
		label: 'Avaliações feitas',
		description: 'Concedida ao atingir o número de avaliações registradas.',
	},
	{
		key: 'FAVORITES_ADDED',
		label: 'Favoritos salvos',
		description: 'Reconhece o hábito de salvar livros como favoritos.',
	},
];

const HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };

function getCriteriaLabel(criteriaType) {
	return CRITERIA_OPTIONS.find((option) => option.key === criteriaType)?.label || criteriaType;
}

function getCriteriaList(achievement = {}) {
	if (Array.isArray(achievement.criteriaPairs) && achievement.criteriaPairs.length > 0) {
		return achievement.criteriaPairs;
	}

	return [
		{ criteriaType: achievement.criteriaType, targetValue: achievement.targetValue },
		{ criteriaType: achievement.criteriaType2, targetValue: achievement.targetValue2 },
		{ criteriaType: achievement.criteriaType3, targetValue: achievement.targetValue3 },
	].filter((item) => Boolean(item?.criteriaType));
}

function getCriteriaSummary(achievement = {}) {
	const items = getCriteriaList(achievement);
	if (items.length === 0) {
		return 'Sem critério';
	}

	return items
		.map((item) => `${getCriteriaLabel(item.criteriaType)} (${item.targetValue || 1})`)
		.join(' + ');
}

function toFormValue(achievement) {
	if (!achievement) {
		return { ...DEFAULT_FORM };
	}

	return {
		id: achievement.id ?? null,
		name: achievement.name || '',
		description: achievement.description || '',
		selectedCriteria: getCriteriaList(achievement).map((item) => item.criteriaType),
		criteriaTargets: {
			READ_BOOKS: String(achievement.targetValue ?? 1),
			RATINGS_CREATED: String(achievement.targetValue2 ?? 1),
			FAVORITES_ADDED: String(achievement.targetValue3 ?? 1),
			...getCriteriaList(achievement).reduce((acc, item) => {
				acc[item.criteriaType] = String(item.targetValue ?? 1);
				return acc;
			}, {}),
		},
		active: achievement.active !== false,
	};
}

function normalizeTargetValue(value) {
	const numericValue = Number(String(value).replace(',', '.'));
	if (!Number.isFinite(numericValue) || numericValue <= 0) {
		return 1;
	}

	return Math.max(1, Math.floor(numericValue));
}

export default function ManageAchievements({ navigation }) {
	const [achievements, setAchievements] = useState([]);
	const [achievementProgress, setAchievementProgress] = useState([]);
	const [achievementAggregate, setAchievementAggregate] = useState([]);
	const [searchText, setSearchText] = useState('');
	const [statusFilter, setStatusFilter] = useState('all');
	const [criteriaFilter, setCriteriaFilter] = useState('all');
	const [sortOrder, setSortOrder] = useState('recent');
	const [form, setForm] = useState(DEFAULT_FORM);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [isDeletingId, setIsDeletingId] = useState(null);
	const [errorMessage, setErrorMessage] = useState('');

	const loadAchievements = async () => {
		try {
			setIsLoading(true);
			setErrorMessage('');
			const [items, progressItems, aggregateItems] = await Promise.all([
				getAchievements(),
				getAchievementProgress().catch(() => []),
				getAchievementsAggregate().catch(() => []),
			]);
			setAchievements(items);
			setAchievementProgress(progressItems);
			setAchievementAggregate(Array.isArray(aggregateItems) ? aggregateItems : []);
		} catch (error) {
			setErrorMessage('Não foi possível carregar as conquistas.');
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		loadAchievements();
	}, []);

	useEffect(() => {
		const unsubscribe = navigation.addListener('focus', loadAchievements);
		return unsubscribe;
	}, [navigation]);

	const filteredAchievements = useMemo(() => {
		const query = searchText.trim().toLowerCase();
		const visible = achievements.filter((achievement) => {
			const matchesQuery = !query || [achievement.name, achievement.description, getCriteriaSummary(achievement)]
				.join(' ')
				.toLowerCase()
				.includes(query);
			const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? achievement.active !== false : achievement.active === false);
			const matchesCriteria = criteriaFilter === 'all' || getCriteriaList(achievement).some((item) => item.criteriaType === criteriaFilter);
			return matchesQuery && matchesStatus && matchesCriteria;
		});

		return [...visible].sort((left, right) => {
			if (sortOrder === 'name') {
				return String(left.name || '').localeCompare(String(right.name || ''), 'pt-BR');
			}

			return Number(right.id) - Number(left.id);
		});
	}, [achievements, criteriaFilter, searchText, sortOrder, statusFilter]);

	const visibleCriteriaOptions = useMemo(() => {
		const criteriaTypes = Array.from(
			new Set(
				achievements
					.flatMap((achievement) => getCriteriaList(achievement).map((item) => item.criteriaType))
					.filter(Boolean)
			)
		);
		return CRITERIA_OPTIONS.filter((option) => criteriaTypes.includes(option.key));
	}, [achievements]);

	const stats = useMemo(() => {
		const activeCount = achievements.filter((achievement) => achievement.active !== false).length;
		return {
			total: achievements.length,
			active: activeCount,
			inactive: achievements.length - activeCount,
		};
	}, [achievements]);

	const progressByAchievementId = useMemo(() => {
		return achievementProgress.reduce((accumulator, item) => {
			accumulator[item.achievementId] = item;
			return accumulator;
		}, {});
	}, [achievementProgress]);

	const aggregateByAchievementId = useMemo(() => {
		return achievementAggregate.reduce((accumulator, item) => {
			accumulator[item.achievementId] = item;
			return accumulator;
		}, {});
	}, [achievementAggregate]);

	const resetForm = () => {
		setForm(DEFAULT_FORM);
	};

	const handleEdit = (achievement) => {
		setForm(toFormValue(achievement));
	};

	const handleSubmit = async () => {
		if (!form.name.trim() || !form.description.trim()) {
			Alert.alert('Campos obrigatórios', 'Preencha nome e descrição para continuar.');
			return;
		}

		const selectedCriteria = CRITERIA_OPTIONS
			.map((option) => option.key)
			.filter((key) => form.selectedCriteria.includes(key));

		if (selectedCriteria.length === 0) {
			Alert.alert('Critério obrigatório', 'Selecione ao menos um critério para a conquista.');
			return;
		}

		const criteriaPairs = selectedCriteria.map((criteriaType) => ({
			criteriaType,
			targetValue: normalizeTargetValue(form.criteriaTargets[criteriaType]),
		}));

		const payload = {
			name: form.name.trim(),
			description: form.description.trim(),
			criteriaPairs,
			active: Boolean(form.active),
		};

		try {
			setIsSaving(true);
			if (form.id) {
				const updated = await updateAchievement(form.id, payload);
				setAchievements((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
				Alert.alert('Conquista atualizada', 'As alterações foram salvas com sucesso.');
			} else {
				const created = await createAchievement(payload);
				setAchievements((prev) => [created, ...prev]);
				Alert.alert('Conquista criada', 'A nova conquista já está disponível no catálogo.');
			}
			resetForm();
		} catch (error) {
			const backendMessage = error?.response?.data?.message || error?.response?.data?.error;
			Alert.alert('Erro', backendMessage || 'Não foi possível salvar esta conquista agora.');
		} finally {
			setIsSaving(false);
		}
	};

	const handleDelete = (achievement) => {
		Alert.alert('Excluir conquista', `Deseja excluir "${achievement?.name || 'esta conquista'}"?`, [
			{ text: 'Cancelar', style: 'cancel' },
			{
				text: 'Excluir',
				style: 'destructive',
				onPress: async () => {
					try {
						setIsDeletingId(achievement.id);
						await deleteAchievement(achievement.id);
						setAchievements((prev) => prev.filter((item) => item.id !== achievement.id));
						if (form.id === achievement.id) {
							resetForm();
						}
					} catch (error) {
						Alert.alert('Erro', 'Não foi possível excluir esta conquista agora.');
					} finally {
						setIsDeletingId(null);
					}
				},
			},
		]);
	};

	const renderAchievement = (achievement) => {
		const isSelected = form.id === achievement.id;
		const progress = progressByAchievementId[achievement.id] || null;
		const criteriaList = getCriteriaList(achievement);
		const totalTarget = Math.max(
			1,
			criteriaList.reduce((sum, item) => sum + Math.max(1, Number(item.targetValue) || 1), 0)
		);
		const normalizedCurrent = progress ? Math.max(0, progress.currentValue) : 0;
		const normalizedTarget = progress ? Math.max(1, progress.targetValue || achievement.targetValue || 1) : totalTarget;
		const progressPercent = Math.min(100, Math.round((normalizedCurrent / normalizedTarget) * 100));
		const progressLabel = progress ? `${Math.min(normalizedCurrent, normalizedTarget)}/${normalizedTarget}` : `0/${normalizedTarget}`;
		return (
			<View key={achievement.id} style={styles.achievementCard}>
				<View style={styles.achievementHeader}>
					<View style={{ flex: 1 }}>
						<Text style={styles.achievementName} numberOfLines={2}>{achievement.name}</Text>
						<Text style={styles.achievementDescription}>{achievement.description}</Text>
					</View>
					<View style={[styles.badge, achievement.active === false ? { backgroundColor: 'rgba(239, 68, 68, 0.12)' } : null]}>
						<Text style={[styles.badgeText, achievement.active === false ? { color: '#b91c1c' } : null]}>
							{achievement.active === false ? 'Inativa' : 'Ativa'}
						</Text>
					</View>
				</View>

				<View style={styles.chipRow}>
					{criteriaList.map((item) => (
						<View key={`${achievement.id}-${item.criteriaType}`} style={styles.chip}>
							<Text style={styles.chipText}>{`${getCriteriaLabel(item.criteriaType)}: ${item.targetValue || 1}`}</Text>
						</View>
					))}
					<View style={styles.chip}>
						<Text style={styles.chipText}>{progressLabel}</Text>
					</View>
					{aggregateByAchievementId[achievement.id] ? (
						<View style={styles.chip}>
							<Text style={styles.chipText}>{`${aggregateByAchievementId[achievement.id].usersMeetingCount}/${aggregateByAchievementId[achievement.id].totalUsers}`}</Text>
						</View>
					) : null}
					{isSelected ? (
						<View style={[styles.chip, styles.chipActive]}>
							<Text style={[styles.chipText, styles.chipTextActive]}>Em edição</Text>
						</View>
					) : null}
				</View>

				<View style={styles.actionRow}>
					<TouchableOpacity
						style={styles.secondaryButton}
						onPress={() => handleEdit(achievement)}
						hitSlop={HIT_SLOP}
						accessibilityRole="button"
						accessibilityLabel={`Editar ${achievement.name}`}
					>
						<Text style={styles.secondaryButtonText}>Editar</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.secondaryButton}
						onPress={() => handleDelete(achievement)}
						disabled={isDeletingId === achievement.id}
						hitSlop={HIT_SLOP}
						accessibilityRole="button"
						accessibilityLabel={`Excluir ${achievement.name}`}
					>
						{isDeletingId === achievement.id ? (
							<ActivityIndicator size="small" color="#334155" />
						) : (
							<Text style={styles.secondaryButtonText}>Excluir</Text>
						)}
					</TouchableOpacity>
				</View>

				<View style={styles.progressWrap}>
					<View style={styles.progressTrack}>
						<View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
					</View>
					<Text style={styles.progressText}>
						{aggregateByAchievementId[achievement.id]
							? `${Number(aggregateByAchievementId[achievement.id].percentage).toFixed(1)}% (${aggregateByAchievementId[achievement.id].usersMeetingCount}/${aggregateByAchievementId[achievement.id].totalUsers})`
							: progress
								? `${progress.label}: ${normalizedCurrent} de ${normalizedTarget}`
								: `Meta estimada: ${normalizedTarget}`}
					</Text>
				</View>
			</View>
		);
	};

	return (
		<View style={styles.screen}>
			<StatusBar barStyle="light-content" />
			<Header
				title="BookV"
				subtitle="Gerenciar conquistas"
				onRightAction={() => navigation.navigate('Admin')}
				rightActionLabel="Painel"
				rightActionIcon="grid-outline"
			/>

			<View style={styles.content}>
				<ScrollView contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
					<View style={styles.card}>
						<View style={styles.cardHeaderRow}>
							<View>
								<Text style={styles.cardTitle}>Catálogo de conquistas</Text>
								<Text style={styles.cardSubtitle}>Crie e ajuste critérios que o sistema aplica automaticamente.</Text>
							</View>
							<View style={styles.badge}>
								<Text style={styles.badgeText}>{stats.total} itens</Text>
							</View>
						</View>

						<View style={[styles.chipRow, { marginTop: 12 }]}>
							<View style={styles.chip}><Text style={styles.chipText}>{stats.active} ativas</Text></View>
							<View style={styles.chip}><Text style={styles.chipText}>{stats.inactive} inativas</Text></View>
						</View>
					</View>

					<View style={styles.card}>
						<Text style={styles.sectionTitle}>Buscar conquistas</Text>
						<Text style={styles.sectionSubtitle}>Filtre por nome, descrição, critério ou meta.</Text>
						<View style={{ marginTop: 12 }}>
							<View style={styles.searchContainer}>
								<Ionicons name="search" size={18} color="#64748b" />
								<TextInput
									value={searchText}
									onChangeText={setSearchText}
									placeholder="Buscar conquistas"
									placeholderTextColor="#94a3b8"
									style={styles.searchInput}
								/>
							</View>
						</View>

						<View style={styles.filterGroup}>
							<Text style={styles.filterLabel}>Status</Text>
							<View style={styles.filterRow}>
								{[
									{ key: 'all', label: 'Todas' },
									{ key: 'active', label: 'Ativas' },
									{ key: 'inactive', label: 'Inativas' },
								].map((option) => {
									const isActive = statusFilter === option.key;
									return (
										<TouchableOpacity
											key={option.key}
											style={[styles.filterChip, isActive ? styles.filterChipActive : null]}
											onPress={() => setStatusFilter(option.key)}
											hitSlop={HIT_SLOP}
											accessibilityRole="button"
											accessibilityState={{ selected: isActive }}
										>
											<Text style={[styles.filterChipText, isActive ? styles.filterChipTextActive : null]}>{option.label}</Text>
										</TouchableOpacity>
									);
								})}
							</View>
						</View>

						<View style={styles.filterGroup}>
							<Text style={styles.filterLabel}>Critério</Text>
							<View style={styles.filterRow}>
								<TouchableOpacity
									style={[styles.filterChip, criteriaFilter === 'all' ? styles.filterChipActive : null]}
									onPress={() => setCriteriaFilter('all')}
									hitSlop={HIT_SLOP}
									accessibilityRole="button"
									accessibilityState={{ selected: criteriaFilter === 'all' }}
								>
									<Text style={[styles.filterChipText, criteriaFilter === 'all' ? styles.filterChipTextActive : null]}>Todos</Text>
								</TouchableOpacity>
								{visibleCriteriaOptions.map((option) => {
									const isActive = criteriaFilter === option.key;
									return (
										<TouchableOpacity
											key={option.key}
											style={[styles.filterChip, isActive ? styles.filterChipActive : null]}
											onPress={() => setCriteriaFilter(option.key)}
											hitSlop={HIT_SLOP}
											accessibilityRole="button"
											accessibilityState={{ selected: isActive }}
										>
											<Text style={[styles.filterChipText, isActive ? styles.filterChipTextActive : null]}>{option.label}</Text>
										</TouchableOpacity>
									);
								})}
							</View>
						</View>

						<View style={styles.filterGroup}>
							<Text style={styles.filterLabel}>Ordenação</Text>
							<View style={styles.filterRow}>
								{[
									{ key: 'recent', label: 'Mais recentes' },
									{ key: 'name', label: 'Nome' },
								].map((option) => {
									const isActive = sortOrder === option.key;
									return (
										<TouchableOpacity
											key={option.key}
											style={[styles.filterChip, isActive ? styles.filterChipActive : null]}
											onPress={() => setSortOrder(option.key)}
											hitSlop={HIT_SLOP}
											accessibilityRole="button"
											accessibilityState={{ selected: isActive }}
										>
											<Text style={[styles.filterChipText, isActive ? styles.filterChipTextActive : null]}>{option.label}</Text>
										</TouchableOpacity>
									);
								})}
							</View>
						</View>
					</View>

					<View style={styles.formCard}>
						<Text style={styles.sectionTitle}>{form.id ? 'Editar conquista' : 'Nova conquista'}</Text>
						<Text style={styles.sectionSubtitle}>Defina nome, descrição, critério e meta para o desbloqueio.</Text>

						<View style={{ marginTop: 14 }}>
							<Text style={styles.fieldLabel}>Nome</Text>
							<TextInput
								value={form.name}
								onChangeText={(value) => setForm((prev) => ({ ...prev, name: value }))}
								placeholder="Ex.: Leitor iniciante"
								placeholderTextColor="#94a3b8"
								style={styles.fieldInput}
							/>
						</View>

						<View style={{ marginTop: 12 }}>
							<Text style={styles.fieldLabel}>Descrição</Text>
							<TextInput
								value={form.description}
								onChangeText={(value) => setForm((prev) => ({ ...prev, description: value }))}
								placeholder="Ex.: Leia 3 livros para desbloquear esta conquista."
								placeholderTextColor="#94a3b8"
								style={[styles.fieldInput, styles.fieldMultiline]}
								multiline
							/>
						</View>

						<View style={{ marginTop: 12 }}>
							<Text style={styles.fieldLabel}>Tipo de critério</Text>
							<View style={styles.criteriaGrid}>
								{CRITERIA_OPTIONS.map((option) => {
									const isActive = form.selectedCriteria.includes(option.key);
									return (
										<TouchableOpacity
											key={option.key}
											style={[styles.criteriaChip, isActive ? styles.criteriaChipActive : null]}
											onPress={() => {
												setForm((prev) => {
													const alreadySelected = prev.selectedCriteria.includes(option.key);
													if (alreadySelected && prev.selectedCriteria.length === 1) {
														return prev;
													}

													const nextSelected = alreadySelected
														? prev.selectedCriteria.filter((key) => key !== option.key)
														: [...prev.selectedCriteria, option.key];

													return {
														...prev,
														selectedCriteria: nextSelected,
													};
												});
											}}
											hitSlop={HIT_SLOP}
											accessibilityRole="button"
											accessibilityState={{ selected: isActive }}
										>
											<Text style={styles.criteriaChipTitle}>{option.label}</Text>
											<Text style={styles.criteriaChipText}>{option.description}</Text>
											{isActive ? (
												<View style={{ marginTop: 8 }}>
													<Text style={styles.fieldLabel}>Meta</Text>
													<TextInput
														value={form.criteriaTargets[option.key]}
														onChangeText={(value) => setForm((prev) => ({
															...prev,
															criteriaTargets: {
																...prev.criteriaTargets,
																[option.key]: value,
															},
														}))}
														placeholder="1"
														placeholderTextColor="#94a3b8"
														style={[styles.fieldInput, { minHeight: 36, paddingVertical: 8 }]}
														keyboardType="numeric"
													/>
												</View>
											) : null}
										</TouchableOpacity>
									);
								})}
							</View>
						</View>

						<Text style={styles.fieldHint}>Selecione 1, 2 ou 3 critérios e defina a meta de cada um.</Text>

						<View style={{ marginTop: 12 }}>
							<View style={styles.toggleRow}>
								<View style={styles.toggleTextWrap}>
									<Text style={styles.toggleTitle}>Conquista ativa</Text>
									<Text style={styles.toggleSubtitle}>Se desativada, ela permanece no catálogo sem ser atribuída.</Text>
								</View>
								<Switch
									value={form.active}
									onValueChange={(value) => setForm((prev) => ({ ...prev, active: value }))}
									rackColor={{ false: '#cbd5e1', true: '#0f766e' }}
									thumbColor="#ffffff"
								/>
							</View>
						</View>

						<View style={styles.actionRow}>
							<TouchableOpacity
								style={styles.primaryButton}
								onPress={handleSubmit}
								disabled={isSaving}
								hitSlop={HIT_SLOP}
								accessibilityRole="button"
								accessibilityLabel={form.id ? 'Salvar alterações da conquista' : 'Criar conquista'}
							>
								{isSaving ? (
									<ActivityIndicator size="small" color="#ffffff" />
								) : (
									<>
										<Ionicons name={form.id ? 'save-outline' : 'add-circle-outline'} size={16} color="#ffffff" />
										<Text style={styles.primaryButtonText}>{form.id ? 'Salvar alterações' : 'Criar conquista'}</Text>
									</>
								)}
							</TouchableOpacity>

							<TouchableOpacity
								style={styles.secondaryButton}
								onPress={resetForm}
								hitSlop={HIT_SLOP}
								accessibilityRole="button"
								accessibilityLabel="Limpar formulário"
							>
								<Text style={styles.secondaryButtonText}>Novo</Text>
							</TouchableOpacity>
						</View>
					</View>

					<View style={styles.listCard}>
						<Text style={styles.sectionTitle}>Conquistas cadastradas</Text>
						<Text style={styles.sectionSubtitle}>Busque, edite ou remova itens do catálogo.</Text>
					</View>

					{isLoading ? (
						<View style={styles.feedbackWrap}>
							<ActivityIndicator size="large" color="#0f766e" />
							<Text style={styles.feedbackText}>Carregando conquistas...</Text>
						</View>
					) : null}

					{!isLoading && !!errorMessage ? (
						<View style={styles.feedbackWrap}>
							<Text style={styles.feedbackText}>{errorMessage}</Text>
						</View>
					) : null}

					{!isLoading && !errorMessage && filteredAchievements.length === 0 ? (
						<View style={styles.emptyState}>
							<Text style={styles.emptyStateText}>Nenhuma conquista encontrada com os filtros atuais.</Text>
						</View>
					) : null}

					{!isLoading && !errorMessage && filteredAchievements.length > 0
						? filteredAchievements.map(renderAchievement)
						: null}
				</ScrollView>
			</View>

			<FooterNav navigation={navigation} activeKey="admin" items={ADMIN_FOOTER_ITEMS} />
		</View>
	);
}