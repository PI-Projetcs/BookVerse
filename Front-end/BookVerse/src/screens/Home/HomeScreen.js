import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Image, Modal, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import FooterNav from '../../components/FooterNav';
import { getHomeViewModel, toggleHomeHighlightLike, updateHomeProgress, updateChapterStatus } from '../../services/homeService';
import { homeStyles as styles, HOME_CHAPTER_ACTIVE_GRADIENT, HOME_CHAPTER_DONE_GRADIENT, HOME_HEADER_GRADIENT, HOME_PROGRESS_GRADIENT } from '../../styles/homeStyles';

const HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };

/*
 * Tela Home
 * - Exibe o Livro do Mês, progresso pessoal, lista de capítulos e destaques da comunidade.
 * - Carrega dados via `getHomeViewModel` e permite ações como curtir destaque,
 *   atualizar progresso e marcar status de capítulos (com updates otimistas).
 */

// Função utilitária: limita um número ao intervalo [0, 1]
function clamp01(value) {
    if (!Number.isFinite(value)) return 0;
    return Math.min(1, Math.max(0, value));
}

export default function HomeScreen({ navigation }) {
	const insets = useSafeAreaInsets();

	const { width: windowWidth, height: windowHeight } = useWindowDimensions();

	// responsividade: celulares pequenos, regulares, grandes
	const isSmall = windowWidth < 360;
	const isLarge = windowWidth > 420;

	const coverWidth = isSmall ? 70 : isLarge ? 100 : 84;
	const coverHeight = Math.round(coverWidth * 1.33);
	const titleSize = isSmall ? 14 : isLarge ? 18 : 16;
	const descSize = isSmall ? 11 : isLarge ? 13 : 12;
	const pillFontSize = isSmall ? 10 : isLarge ? 12 : 11;
	const isLandscape = windowWidth > windowHeight;
	const cardPadding = isSmall ? 10 : isLarge ? 16 : 14;
	const cardPaddingLandscape = cardPadding + (isLandscape ? 4 : 0);
	const badgeSize = isSmall ? 22 : isLarge ? 34 : 26;

	const [bookOfMonth, setBookOfMonth] = useState({
		id: 1,
		monthLabel: 'Marco 2026',
		title: 'Livro do Mes',
		author: 'Autor(a)',
		description: 'Descricao nao informada.',
		synopsis: 'Descricao nao informada.',
		pages: 0,
		members: 0,
		dateLabel: '',
		coverUrl: 'https://placehold.co/240x320/f3f4f6/111827?text=Capa',
	});

	const [progress, setProgress] = useState({
		currentPage: 0,
		totalPages: 0,
		weeklyDone: 0,
		weeklyGoal: 1,
	});

	const [chapters, setChapters] = useState([]);
	const [highlights, setHighlights] = useState([]);

	const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
	const [draftProgress, setDraftProgress] = useState({
		currentPage: '0',
		totalPages: '0',
		weeklyDone: '0',
		weeklyGoal: '1',
	});

	const effectiveTotalPages = progress.totalPages || bookOfMonth.pages || 0;
	const percent = clamp01(effectiveTotalPages ? progress.currentPage / effectiveTotalPages : 0);
	const percentLabel = `${Math.round(percent * 100)}%`;
	const weeklyPercent = clamp01(progress.weeklyGoal ? progress.weeklyDone / progress.weeklyGoal : 0);

	// Carrega os dados da home (bookOfMonth, progresso, capítulos, destaques)
	// e monta o estado local a partir do view model fornecido pelo backend.
	const loadHomeData = useCallback(async () => {
		const viewModel = await getHomeViewModel();
		if (!viewModel) {
			return;
		}

		setBookOfMonth(viewModel.bookOfMonth);
		setProgress(viewModel.progress);
		setChapters(viewModel.chapters);
		setHighlights(viewModel.highlights);
		setDraftProgress({
			currentPage: String(viewModel.progress.currentPage ?? 0),
			totalPages: String(viewModel.progress.totalPages || viewModel.bookOfMonth?.pages || 0),
			weeklyDone: String(viewModel.progress.weeklyDone ?? 0),
			weeklyGoal: String(viewModel.progress.weeklyGoal ?? 1),
		});
	}, []);

	useEffect(() => {
		loadHomeData();
	}, [loadHomeData]);

	useEffect(() => {
		const unsubscribe = navigation.addListener('focus', loadHomeData);
		return unsubscribe;
	}, [navigation, loadHomeData]);

	const handleOpenBook = () => {
		if (navigation?.navigate) {
			navigation.navigate('BookDetails', { id: bookOfMonth.id });
		}
	};

	const handleOpenDiscussion = () => {
		if (navigation?.navigate) {
			navigation.navigate('Discussion', { bookId: bookOfMonth.id });
		}
	};

	const handleSelectChapter = (chapter) => {
		if (statusPillPressRef.current) {
			return;
		}

		if (chapter?.state === 'locked') {
			Alert.alert('Capítulo bloqueado', 'Conclua os capítulos anteriores para desbloquear este capítulo.');
			return;
		}

		if (navigation?.navigate) {
			navigation.navigate('Discussion', { bookId: bookOfMonth.id, chapterId: chapter?.id });
		}
	};

	// Alterna o 'like' de um destaque localmente (atualização otimista)
	// e tenta persistir a ação no backend.
	const handleToggleLike = async (highlightId) => {
		let nextLiked = false;

		setHighlights((prev) =>
			prev.map((h) => {
				if (h.id !== highlightId) return h;
				nextLiked = !h.liked;
				const nextLikes = Math.max(0, (h.likes || 0) + (nextLiked ? 1 : -1));
				return { ...h, liked: nextLiked, likes: nextLikes };
			})
		);

		try {
			const updated = await toggleHomeHighlightLike(highlightId, nextLiked);
			if (!updated) {
				return;
			}

			setHighlights((prev) =>
				prev.map((h) =>
					h.id === highlightId
						? {
							...h,
							liked: Boolean(updated.liked),
							likes: Number(updated.likes) || h.likes,
						}
						: h
				)
			);
		} catch (error) {
			// Mantém atualização otimista se a requisição falhar.
		}
	};

	// Abre o modal para edição do progresso de leitura do usuário.
	const openProgressModal = () => {
		setDraftProgress({
			currentPage: String(progress.currentPage ?? ''),
			totalPages: String(progress.totalPages || bookOfMonth.pages || ''),
			weeklyDone: String(progress.weeklyDone ?? ''),
			weeklyGoal: String(progress.weeklyGoal ?? ''),
		});
		setIsProgressModalOpen(true);
	};

	// Valida e persiste o progresso (atualização local otimista,
	// tenta salvar no backend e mantém o estado local em caso de falha).
	const saveProgressModal = async () => {
		const next = {
			currentPage: Number(draftProgress.currentPage),
			totalPages: Number(draftProgress.totalPages),
			weeklyDone: Number(draftProgress.weeklyDone),
			weeklyGoal: Number(draftProgress.weeklyGoal),
		};

		if (![next.currentPage, next.totalPages, next.weeklyDone, next.weeklyGoal].every(Number.isFinite)) {
			Alert.alert('Valores inválidos', 'Preencha apenas números.');
			return;
		}

		if (next.totalPages <= 0 || next.weeklyGoal <= 0) {
			Alert.alert('Valores inválidos', 'Total de páginas e meta semanal precisam ser maiores que zero.');
			return;
		}

		const sanitized = {
			currentPage: Math.max(0, Math.min(next.currentPage, next.totalPages)),
			totalPages: next.totalPages,
			weeklyDone: Math.max(0, Math.min(next.weeklyDone, next.weeklyGoal)),
			weeklyGoal: next.weeklyGoal,
		};

		setProgress(sanitized);
		setIsProgressModalOpen(false);

		try {
			const persisted = await updateHomeProgress(sanitized);
			if (persisted) {
				setProgress(persisted);
			}
		} catch (error) {
			// Mantém atualização local se a requisição falhar.
		}
	};

	// Modal de status do capítulo
	const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
	const [selectedChapter, setSelectedChapter] = useState(null);
	const statusPillPressRef = useRef(false);
	const statusPillResetTimeoutRef = useRef(null);

	// Atualiza o status de um capítulo na UI (otimista) e envia a alteração
	// ao backend. Em caso de erro a UI mantém a atualização otimista.
	const handleChangeChapterStatus = async (chapterId, nextStatus) => {
		const normalizedStatus = String(nextStatus || '').trim();
		const nextState =
			normalizedStatus === 'Concluído'
				? 'done'
				: normalizedStatus === 'Em leitura'
					? 'active'
					: 'idle';

		setChapters((prev) =>
			prev.map((c) =>
				c.id === chapterId
					? { ...c, status: normalizedStatus, state: nextState }
					: c
			)
		);

		setIsStatusModalOpen(false);


		try {
			await updateChapterStatus(bookOfMonth.id, chapterId, nextStatus);
		} catch (err) {
				// ignorar — atualização otimista mantida
		}

			// mostrar feedback
		showToast(
			normalizedStatus
				? `Capítulo ${chapterId} marcado como ${normalizedStatus}`
				: `Status do capítulo ${chapterId} limpo`
		);
	};

	// Feedback via toast
	const [toastMessage, setToastMessage] = useState('');
	const [toastVisible, setToastVisible] = useState(false);
	const toastTimeoutRef = useRef(null);

	// Mostra uma mensagem curta (toast) para feedback do usuário.
	const showToast = (message, duration = 2500) => {
		if (toastTimeoutRef.current) {
			clearTimeout(toastTimeoutRef.current);
		}
		setToastMessage(message);
		setToastVisible(true);
		toastTimeoutRef.current = setTimeout(() => {
			setToastVisible(false);
			toastTimeoutRef.current = null;
		}, duration);
	};

	useEffect(() => {
		return () => {
			if (toastTimeoutRef.current) {
				clearTimeout(toastTimeoutRef.current);
			}
			if (statusPillResetTimeoutRef.current) {
				clearTimeout(statusPillResetTimeoutRef.current);
			}
		};
	}, []);

	return (
		<SafeAreaView style={styles.safeArea}>
			<StatusBar barStyle="light-content" />

			<LinearGradient
				colors={HOME_HEADER_GRADIENT}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 0 }}
				style={styles.header}
			>
				<View style={[styles.headerRow, { paddingTop: insets.top + 8 }]}>
					<View style={styles.headerTitleRow}>
						<MaterialCommunityIcons name="book-open-page-variant" size={20} color="#facc15" />
						<Text style={styles.headerTitle}>Livro do Mês</Text>
					</View>
					<View style={styles.headerChip}>
						<Ionicons name="calendar-outline" size={14} color="#fef3c7" />
						<Text style={styles.headerChipText}>{bookOfMonth.monthLabel}</Text>
					</View>
				</View>
			</LinearGradient>

			<View style={styles.container}>
				<ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
					<View style={styles.sectionHeader}>
						<Text style={styles.sectionTitle}>Livro do Mês</Text>
					</View>

					<TouchableOpacity
						style={[styles.bookCard, { padding: cardPaddingLandscape }]}
						activeOpacity={0.9}
						onPress={handleOpenBook}
						hitSlop={HIT_SLOP}
						accessibilityRole="button"
						accessibilityLabel={`Abrir livro do mês ${bookOfMonth.title}, de ${bookOfMonth.author}`}
					>
						<Image source={{ uri: bookOfMonth.coverUrl }} style={[styles.bookCover, { width: coverWidth, height: coverHeight }]} />
						<View style={styles.bookInfo}>
							<Text style={[styles.bookTitle, { fontSize: titleSize }]} numberOfLines={1}>
								{bookOfMonth.title}
							</Text>
							<Text style={styles.bookAuthor} numberOfLines={1}>
								{bookOfMonth.author}
							</Text>
							<Text style={[styles.bookDesc, { fontSize: descSize, lineHeight: descSize + 5, color: isSmall ? '#0f172a' : styles.bookDesc.color }]} numberOfLines={3}>
								{bookOfMonth.synopsis || bookOfMonth.description}
							</Text>

							<View style={styles.bookMetaRow}>
								{Number(bookOfMonth.members) > 0 ? (
									<View style={styles.bookMetaItem}>
										<Ionicons name="people-outline" size={14} color="#64748b" />
										<Text style={styles.bookMetaText}>{bookOfMonth.members} membros</Text>
									</View>
								) : null}
								<View style={styles.bookMetaItem}>
									<Ionicons name="calendar-clear-outline" size={14} color="#64748b" />
									<Text style={styles.bookMetaText}>{bookOfMonth.dateLabel}</Text>
								</View>
							</View>
						</View>
					</TouchableOpacity>

					<View style={styles.card}>
						<View style={styles.cardHeaderRow}>
							<Text style={styles.cardTitle}>Seu Progresso</Text>
							<TouchableOpacity
								activeOpacity={0.85}
								onPress={openProgressModal}
								hitSlop={HIT_SLOP}
								accessibilityRole="button"
								accessibilityLabel="Atualizar progresso de leitura"
							>
								<Text style={styles.cardAction}>Atualizar</Text>
							</TouchableOpacity>
						</View>

						<View style={styles.progressBlock}>
							<View style={styles.progressTopRow}>
								<Text style={styles.progressLabel}>
									Páginas lidas
								</Text>
								<Text style={styles.progressValue}>
									{progress.currentPage} de {effectiveTotalPages}
								</Text>
							</View>
							<Text style={styles.progressHint}>
								Total do livro: {effectiveTotalPages} páginas
							</Text>
							<View style={styles.progressTrack}>
								<LinearGradient
									colors={HOME_PROGRESS_GRADIENT}
									start={{ x: 0, y: 0 }}
									end={{ x: 1, y: 0 }}
									style={[styles.progressFill, { width: `${percent * 100}%` }]}
								/>
							</View>
						</View>

						<View style={[styles.progressBlock, styles.progressBlockTight]}>
							<View style={styles.progressTopRow}>
								<Text style={styles.progressLabel}>Meta semanal</Text>
								<Text style={styles.progressValue}>
									{progress.weeklyDone} / {progress.weeklyGoal} páginas
								</Text>
							</View>
							<Text style={styles.progressHint}>
								Ajuste essa meta no botão Atualizar
							</Text>
							<View style={styles.progressTrackMuted}>
								<LinearGradient
									colors={HOME_PROGRESS_GRADIENT}
									start={{ x: 0, y: 0 }}
									end={{ x: 1, y: 0 }}
									style={[styles.progressFillMuted, { width: `${weeklyPercent * 100}%` }]}
								/>
							</View>
						</View>
					</View>

					<View style={styles.card}>
						<View style={styles.cardHeaderRow}>
							<Text style={styles.cardTitle}>Capítulos</Text>
							<TouchableOpacity
								activeOpacity={0.85}
								onPress={handleOpenDiscussion}
								hitSlop={HIT_SLOP}
								accessibilityRole="button"
								accessibilityLabel="Ir para a discussão do livro do mês"
							>
								<View style={styles.linkRow}>
									<Ionicons name="chatbubbles-outline" size={14} color="#7D1F3E" />
									<Text style={styles.linkText}>Ir para discussão</Text>
								</View>
							</TouchableOpacity>
						</View>

						<View style={styles.chapterList}>
							{chapters.map((ch) => {
								const isDone = ch.state === 'done';
								const isActive = ch.state === 'active';
								const isLocked = ch.state === 'locked';
								return (
									<TouchableOpacity
										key={String(ch.id)}
										activeOpacity={0.9}
										onPress={() => handleSelectChapter(ch)}
										hitSlop={HIT_SLOP}
										accessibilityRole="button"
										accessibilityLabel={`Abrir capítulo ${ch.id}, ${ch.title}`}
										accessibilityState={{ disabled: isLocked }}
										style={[
											styles.chapterRow,
											isDone && styles.chapterRowDone,
											isActive && styles.chapterRowActive,
											isLocked && styles.chapterRowLocked,
										]}
									>
														{isDone ? (
															<LinearGradient
																colors={HOME_CHAPTER_DONE_GRADIENT}
																start={{ x: 0, y: 0 }}
																end={{ x: 1, y: 0 }}
																style={[styles.chapterBadge, { width: badgeSize, height: badgeSize, borderRadius: badgeSize / 2 }]}
															>
																<Text style={[styles.chapterBadgeText, { fontSize: badgeSize / 2.6 }]}>{ch.id}</Text>
															</LinearGradient>
														) : isActive ? (
															<LinearGradient
																colors={HOME_CHAPTER_ACTIVE_GRADIENT}
																start={{ x: 0, y: 0 }}
																end={{ x: 1, y: 0 }}
																style={[styles.chapterBadge, { width: badgeSize, height: badgeSize, borderRadius: badgeSize / 2 }]}
															>
																<Text style={[styles.chapterBadgeText, { fontSize: badgeSize / 2.6 }]}>{ch.id}</Text>
															</LinearGradient>
														) : (
															<View style={[styles.chapterBadge, isActive && styles.chapterBadgeActive, isLocked && styles.chapterBadgeLocked, { width: badgeSize, height: badgeSize, borderRadius: badgeSize / 2 }]}> 
																<Text style={[styles.chapterBadgeText, isLocked && styles.chapterBadgeTextLocked, { fontSize: badgeSize / 2.6 }]}> 
																	{ch.id}
																</Text>
															</View>
														)}

										<View style={styles.chapterTextCol}>
											<View style={styles.chapterTitleRow}>
												<Text style={[styles.chapterTitle, isLocked && styles.chapterTitleLocked]} numberOfLines={1}>
													{ch.title}
												</Text>
												{(() => {
													const displayStatus = (ch.status || '').trim() || 'Marcar';
													return (
														<TouchableOpacity
															activeOpacity={isLocked ? 1 : 0.8}
															disabled={isLocked}
															onPress={(event) => {
																event?.stopPropagation?.();
																if (isLocked) return;
																setSelectedChapter(ch);
																setIsStatusModalOpen(true);
															}}
															onPressIn={(event) => {
																event?.stopPropagation?.();
																statusPillPressRef.current = true;
																if (statusPillResetTimeoutRef.current) {
																	clearTimeout(statusPillResetTimeoutRef.current);
																}
																statusPillResetTimeoutRef.current = setTimeout(() => {
																	statusPillPressRef.current = false;
																	statusPillResetTimeoutRef.current = null;
																}, 250);
															}}
															hitSlop={HIT_SLOP}
															style={[
																styles.chapterStatusPill,
																isDone && styles.chapterStatusPillDone,
																isActive && styles.chapterStatusPillActive,
																isLocked && styles.chapterStatusPillLocked,
																{ minWidth: 64, alignItems: 'center', justifyContent: 'center' },
															]}
														>
															<Text style={[styles.chapterStatusPillText, { fontSize: pillFontSize }, isLocked && styles.chapterStatusPillTextLocked]}>{displayStatus}</Text>
														</TouchableOpacity>
													);
												})()}
											</View>
										</View>

										<Ionicons
											name={isLocked ? 'lock-closed-outline' : 'chevron-forward'}
											size={18}
											color={isLocked ? '#9ca3af' : '#94a3b8'}
										/>
									</TouchableOpacity>
								);
							})}
						</View>
					</View>

					<View style={styles.sectionHeader}>
						<Text style={styles.sectionTitle}>Destaques da Comunidade</Text>
					</View>

					{highlights.map((h) => (
						<View key={h.id} style={styles.highlightCard}>
							<Ionicons name="chatbox-ellipses-outline" size={18} color="#B8941F" style={styles.highlightIcon} />
							<Text style={styles.highlightQuote} numberOfLines={3}>
								“{h.text}”
							</Text>
							<View style={styles.highlightBottomRow}>
								<Text style={styles.highlightAuthor}>— {h.author}</Text>
								<TouchableOpacity
									activeOpacity={0.85}
									style={styles.likesRow}
									onPress={() => handleToggleLike(h.id)}
									hitSlop={HIT_SLOP}
									accessibilityRole="button"
									accessibilityLabel={`Curtir destaque de ${h.author}`}
								>
									<Ionicons name={h.liked ? 'heart' : 'heart-outline'} size={14} color="#7D1F3E" />
									<Text style={styles.likesText}>{h.likes}</Text>
								</TouchableOpacity>
							</View>
						</View>
					))}

					<View style={styles.bottomSpacer} />
				</ScrollView>

				<FooterNav navigation={navigation} activeKey="inicio" />
			</View>

				{toastVisible ? (
					<View style={styles.toastContainer} pointerEvents="none">
						<Text style={styles.toastText}>{toastMessage}</Text>
					</View>
				) : null}

			<Modal
				visible={isProgressModalOpen}
				transparent
				animationType="fade"
				onRequestClose={() => setIsProgressModalOpen(false)}
			>
				<View style={styles.modalBackdrop}>
					<View style={styles.modalCard}>
						<Text style={styles.modalTitle}>Atualizar progresso</Text>
						<Text style={styles.modalSubtitle}>
							Informe a página atual, as páginas feitas na semana e a meta semanal desejada.
						</Text>

						<View style={styles.modalGrid}>
							<View style={styles.modalField}>
								<Text style={styles.modalLabel}>Página atual</Text>
								<TextInput
									value={draftProgress.currentPage}
									onChangeText={(t) => setDraftProgress((p) => ({ ...p, currentPage: t.replace(/[^\d]/g, '') }))}
									keyboardType="number-pad"
									style={styles.modalInput}
									placeholder="0"
									placeholderTextColor="#9ca3af"
									accessibilityLabel="Página atual lida"
								/>
							</View>

							<View style={styles.modalField}>
								<Text style={styles.modalLabel}>Total de páginas do livro</Text>
								<TextInput
									value={draftProgress.totalPages}
									editable={false}
									keyboardType="number-pad"
									style={[styles.modalInput, { color: '#6b7280', backgroundColor: '#f1f5f9' }]}
									placeholder="0"
									placeholderTextColor="#9ca3af"
									accessibilityLabel="Total de páginas do livro"
								/>
							</View>

							<View style={styles.modalField}>
								<Text style={styles.modalLabel}>Feitas na semana</Text>
								<TextInput
									value={draftProgress.weeklyDone}
									onChangeText={(t) => setDraftProgress((p) => ({ ...p, weeklyDone: t.replace(/[^\d]/g, '') }))}
									keyboardType="number-pad"
									style={styles.modalInput}
									placeholder="0"
									placeholderTextColor="#9ca3af"
									accessibilityLabel="Páginas lidas na semana"
								/>
							</View>

							<View style={styles.modalField}>
								<Text style={styles.modalLabel}>Meta semanal ajustável</Text>
								<TextInput
									value={draftProgress.weeklyGoal}
									onChangeText={(t) => setDraftProgress((p) => ({ ...p, weeklyGoal: t.replace(/[^\d]/g, '') }))}
									keyboardType="number-pad"
									style={styles.modalInput}
									placeholder="0"
									placeholderTextColor="#9ca3af"
									accessibilityLabel="Meta semanal de páginas"
								/>
							</View>
						</View>

						<View style={styles.modalActions}>
							<TouchableOpacity
								activeOpacity={0.9}
								style={[styles.modalButton, styles.modalButtonGhost]}
								onPress={() => setIsProgressModalOpen(false)}
								hitSlop={HIT_SLOP}
								accessibilityRole="button"
								accessibilityLabel="Cancelar atualização do progresso"
							>
								<Text style={[styles.modalButtonText, styles.modalButtonTextGhost]}>Cancelar</Text>
							</TouchableOpacity>

							<TouchableOpacity
								activeOpacity={0.9}
								style={[styles.modalButton, styles.modalButtonPrimary]}
								onPress={saveProgressModal}
								hitSlop={HIT_SLOP}
								accessibilityRole="button"
								accessibilityLabel="Salvar progresso de leitura"
							>
								<Text style={styles.modalButtonText}>Salvar</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>

			<Modal
				visible={isStatusModalOpen}
				transparent
				animationType="fade"
				onRequestClose={() => setIsStatusModalOpen(false)}
			>
				<View style={styles.modalBackdrop}>
					<View style={styles.modalCard}>
						<Text style={styles.modalTitle}>Atualizar status do capítulo</Text>
						<Text style={styles.modalSubtitle}>
							Selecione se você já concluiu ou está lendo este capítulo.
						</Text>

						<View style={{ marginTop: 12 }}>
							<TouchableOpacity
								style={[
									styles.modalButton,
									styles.modalButtonStacked,
									{ marginBottom: 8, backgroundColor: '#6B7C59', borderWidth: 1, borderColor: '#4A5840' },
								]}
								onPress={() => handleChangeChapterStatus(selectedChapter?.id, 'Concluído')}
							>
								<Text style={styles.modalButtonText}>Concluído</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[
									styles.modalButton,
									styles.modalButtonStacked,
									{ marginBottom: 8, backgroundColor: '#D4AF37', borderWidth: 1, borderColor: '#B8941F' },
								]}
								onPress={() => handleChangeChapterStatus(selectedChapter?.id, 'Em leitura')}
							>
								<Text style={[styles.modalButtonText, { color: '#111827' }]}>Em leitura</Text>
							</TouchableOpacity>
						</View>
						<View style={{ marginTop: 12 }}>
							<TouchableOpacity style={[styles.modalButton, styles.modalButtonStacked, styles.modalButtonGhost]} onPress={() => handleChangeChapterStatus(selectedChapter?.id, '')}>
								<Text style={[styles.modalButtonText, styles.modalButtonTextGhost]}>Limpar status</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[
									styles.modalButton,
									styles.modalButtonStacked,
									{ marginTop: 8, backgroundColor: '#7D1F3E', borderWidth: 1, borderColor: '#6B0F2E' },
								]}
								onPress={() => setIsStatusModalOpen(false)}
							>
								<Text style={styles.modalButtonText}>Cancelar</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		</SafeAreaView>
	);
}

