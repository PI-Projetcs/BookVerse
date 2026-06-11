import FooterNav from '../../components/FooterNav';
import {
	deleteBookRating,
	getBookById,
	getBookRatings,
	getDiscussions,
	rateBook,
	updateBookRating,
} from '../../services/bookService';
import { addFavoriteBook, getUserFavorites, removeFavoriteBook } from '../../services/profileService';
import { bookDetailsStyles as styles } from '../../styles/bookDetailsStyles';
import {
	formatRatingDate,
	getRatingAuthor,
	getRatingStatusLabel,
	pickFeaturedRatings,
	renderRatingDistribution,
} from '../../utils/ratingUtils';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
	Alert,
    ActivityIndicator,
    Image,
    ScrollView,
    StatusBar,
    Text,
	TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { GENRE_CHIP_STYLES, normalizeGenreKey } from '../../constants/genreThemes';
import { useAuth } from '../../context/AuthContext';

// Tela de detalhes do livro.
// Tecnologias utilizadas: React Native, SafeAreaView, serviços de livro e perfil.
// Objetivo: concentrar sinopse, autor, avaliações, favoritos e comentários em um só lugar.
// Observações: a tela combina dados públicos e dados do usuário autenticado com fallback seguro.
const FALLBACK_COVER = 'https://placehold.co/420x640/0f172a/f8fafc?text=Sem+Capa';

// Área de toque ampliada para botões pequenos da tela.
// Tecnologias utilizadas: propriedade hitSlop do React Native.
// Objetivo: melhorar a usabilidade de ações como voltar, favoritar e avaliar.
// Observações: ajuda acessibilidade sem poluir a composição visual.
const HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };

// Renderiza ícones de estrela para compor notas e resumos visuais.
// Tecnologias utilizadas: Ionicons e mapeamento de arrays.
// Objetivo: representar a nota média e distribuições de forma rápida de ler.
// Observações: o valor é normalizado para evitar estrelas fora da faixa.
function renderStars(value, size = 16, activeColor = '#f59e0b', inactiveColor = '#cbd5e1') {
	const normalizedValue = Math.max(0, Math.min(5, Number(value) || 0));
	return [1, 2, 3, 4, 5].map((star) => (
		<Ionicons
			key={`star-${star}`}
			name={star <= normalizedValue ? 'star' : 'star-outline'}
			size={size}
			color={star <= normalizedValue ? activeColor : inactiveColor}
		/>
	));
}

// Extrai comentários de capítulos e mantém apenas os mais relevantes.
// Tecnologias utilizadas: flatMap, sort e slice.
// Objetivo: destacar comentários da comunidade ligados à leitura do livro.
// Observações: o recorte prioriza engajamento e reduz excesso de conteúdo na tela.
function extractMemberComments(chapters = []) {
	if (!Array.isArray(chapters)) {
		return [];
	}

	return chapters
		.flatMap((chapter) => {
			const chapterTitle = chapter?.title || '';
			const comments = Array.isArray(chapter?.comments) ? chapter.comments : [];
			return comments.map((comment) => ({
				...comment,
				chapterTitle,
			}));
		})
		.sort((left, right) => (Number(right?.likes) || 0) - (Number(left?.likes) || 0))
		.slice(0, 4);
}

// Componente principal da tela de detalhes do livro.
// Tecnologias utilizadas: useState, useEffect, useMemo, useCallback, serviços de backend.
// Objetivo: carregar detalhes, avaliar, favoritar e exibir interações da comunidade.
// Observações: separa estado do livro, estado do usuário e feedback visual por carregamento.
export default function BookDetailsScreen({ navigation, route }) {
	const insets = useSafeAreaInsets();
	const { session, isAuthenticated } = useAuth();
	const bookId = route?.params?.id;
	const [book, setBook] = useState(null);
	const [ratings, setRatings] = useState([]);
	const [memberComments, setMemberComments] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState('');
	const [myRating, setMyRating] = useState(0);
	const [myReview, setMyReview] = useState('');
	const [isSavingRating, setIsSavingRating] = useState(false);
	const [isFavorite, setIsFavorite] = useState(false);
	const [isUpdatingFavorite, setIsUpdatingFavorite] = useState(false);

	// Localiza a avaliação já existente do usuário logado neste livro.
	// Tecnologias utilizadas: useMemo e Array.find.
	// Objetivo: preencher nota e comentário quando o usuário volta à tela.
	// Observações: a dependência em session.id evita lookup desnecessário.
	const myExistingRating = useMemo(() => {
		if (!session?.id) {
			return null;
		}

		return ratings.find((item) => Number(item.userId) === Number(session.id)) || null;
	}, [ratings, session?.id]);

	// Filtra apenas avaliações aprovadas para compor a média pública.
	// Tecnologias utilizadas: useMemo e Array.filter.
	// Objetivo: esconder itens ainda pendentes ou rejeitados do público.
	// Observações: mantém a leitura do livro coerente com o que já foi publicado.
	const approvedRatings = useMemo(
		() => ratings.filter((item) => !item?.status || item.status === 'APPROVED'),
		[ratings]
	);

	// Calcula a média pública exibida no topo do livro.
	// Tecnologias utilizadas: useMemo e Array.reduce.
	// Objetivo: mostrar a nota consolidada sem depender de novo cálculo no backend.
	// Observações: quando não há avaliações aprovadas, usa o valor básico do livro.
	const averageRating = useMemo(() => {
		if (!approvedRatings.length) {
			return Number(book?.rating || 0);
		}

		const sum = approvedRatings.reduce((acc, item) => acc + Number(item?.rating || 0), 0);
		return sum / approvedRatings.length;
	}, [approvedRatings, book?.rating]);

	// Total de avaliações aprovadas exibidas ao usuário.
	// Tecnologias utilizadas: estado derivado simples.
	// Objetivo: contextualizar a confiabilidade da nota média.
	// Observações: número pequeno de avaliações pede leitura mais cuidadosa da média.
	const totalRatings = approvedRatings.length;

	// Gera a distribuição das avaliações para o gráfico de resumo.
	// Tecnologias utilizadas: useMemo e utilitário de avaliação.
	// Objetivo: apresentar a dispersão das notas de forma visual.
	// Observações: a composição do objeto deve ser estável para manter a UI leve.
	const ratingSummary = useMemo(() => {
		return renderRatingDistribution(approvedRatings);
	}, [approvedRatings]);

	// Seleciona as avaliações em destaque para o card da comunidade.
	// Tecnologias utilizadas: useMemo e utilitário de seleção.
	// Objetivo: mostrar apenas alguns exemplos relevantes de feedback.
	// Observações: reduz ruído ao evitar listar todas as avaliações de uma vez.
	const featuredRatings = useMemo(() => {
		return pickFeaturedRatings(approvedRatings);
	}, [approvedRatings]);

	// Carrega detalhes do livro, discussões, avaliações e favoritos do usuário.
	// Tecnologias utilizadas: useCallback, Promise.all, serviços de livro e perfil.
	// Objetivo: reunir os dados necessários para montar a tela em um só fluxo.
	// Observações: o carregamento encadeado evita quebrar a tela quando um endpoint secundário falha.
	const loadDetails = useCallback(async () => {
		try {
			setIsLoading(true);
			setErrorMessage('');
			const [bookResult, discussionsResult] = await Promise.all([
				getBookById(bookId),
				getDiscussions(bookId),
			]);
			setBook(bookResult || null);
			setMemberComments(extractMemberComments(discussionsResult));

			try {
				const ratingsResult = await getBookRatings(bookId);
				setRatings(Array.isArray(ratingsResult?.items) ? ratingsResult.items : []);
			} catch (ratingsError) {
				setRatings([]);
			}

			if (isAuthenticated) {
				try {
					const favoriteBooks = await getUserFavorites();
					setIsFavorite(Array.isArray(favoriteBooks) && favoriteBooks.some((item) => Number(item?.id) === Number(bookId)));
				} catch (favoriteError) {
					setIsFavorite(false);
				}
			} else {
				setIsFavorite(false);
			}
		} catch (error) {
			setErrorMessage('Não foi possível carregar os detalhes do livro.');
			setMemberComments([]);
			setRatings([]);
			setIsFavorite(false);
		} finally {
			setIsLoading(false);
		}
	}, [bookId, isAuthenticated]);

	// Inicia o carregamento ou mostra mensagem quando o livro não existe.
	// Tecnologias utilizadas: useEffect.
	// Objetivo: garantir que a tela sempre reaja ao parâmetro de rota.
	// Observações: o estado de erro substitui a interface principal quando não há id válido.
	useEffect(() => {
		if (bookId) {
			loadDetails();
		} else {
			setErrorMessage('Livro não encontrado.');
			setIsLoading(false);
		}
	}, [bookId, loadDetails]);

	// Sincroniza o formulário pessoal de avaliação com a avaliação já salva.
	// Tecnologias utilizadas: useEffect.
	// Objetivo: abrir a tela com a nota e o comentário previamente enviados.
	// Observações: quando não existe avaliação, o formulário volta ao estado inicial.
	useEffect(() => {
		if (myExistingRating) {
			setMyRating(Number(myExistingRating.rating || 0));
			setMyReview(myExistingRating.review || '');
			return;
		}

		setMyRating(0);
		setMyReview('');
	}, [myExistingRating]);

	// Salva uma nova avaliação ou atualiza a existente.
	// Tecnologias utilizadas: Alert, rateBook, updateBookRating, async/await.
	// Objetivo: permitir feedback do usuário com validação simples de faixa.
	// Observações: o recarregamento após salvar mantém a UI alinhada ao backend.
	const handleSaveRating = async () => {
		if (!isAuthenticated) {
			Alert.alert('Atenção', 'Faça login para avaliar este livro.');
			return;
		}

		if (!Number.isInteger(myRating) || myRating < 1 || myRating > 5) {
			Alert.alert('Avaliação inválida', 'Selecione de 1 a 5 estrelas.');
			return;
		}

		try {
			setIsSavingRating(true);
			if (myExistingRating) {
				await updateBookRating(bookId, myRating, myReview);
				Alert.alert('Sucesso', 'Sua avaliação foi atualizada e está pendente de aprovação.');
			} else {
				await rateBook(bookId, myRating, myReview);
				Alert.alert('Sucesso', 'Sua avaliação foi enviada e está pendente de aprovação.');
			}
			await loadDetails();
		} catch (error) {
			Alert.alert('Erro', 'Não foi possível salvar sua avaliação agora.');
		} finally {
			setIsSavingRating(false);
		}
	};

	// Remove a avaliação do usuário após confirmação explícita.
	// Tecnologias utilizadas: Alert e deleteBookRating.
	// Objetivo: oferecer controle completo sobre a própria contribuição.
	// Observações: o fluxo bloqueia exclusão acidental com modal de confirmação.
	const handleDeleteRating = async () => {
		if (!myExistingRating) {
			return;
		}

		Alert.alert('Excluir avaliação', 'Deseja remover sua avaliação deste livro?', [
			{ text: 'Cancelar', style: 'cancel' },
			{
				text: 'Excluir',
				style: 'destructive',
				onPress: async () => {
					try {
						setIsSavingRating(true);
						await deleteBookRating(bookId);
						setMyRating(0);
						setMyReview('');
						await loadDetails();
						Alert.alert('Sucesso', 'Sua avaliação foi removida.');
					} catch (error) {
						Alert.alert('Erro', 'Não foi possível excluir sua avaliação agora.');
					} finally {
						setIsSavingRating(false);
					}
				},
			},
		]);
	};

	// Alterna o livro entre favoritos e não favoritos.
	// Tecnologias utilizadas: Alert, addFavoriteBook e removeFavoriteBook.
	// Objetivo: permitir salvar o livro para acesso rápido depois.
	// Observações: a proteção contra usuário não autenticado evita requisições inválidas.
	const handleToggleFavorite = async () => {
		if (!isAuthenticated) {
			Alert.alert('Atenção', 'Faça login para salvar este livro como favorito.');
			return;
		}

		try {
			setIsUpdatingFavorite(true);
			if (isFavorite) {
				await removeFavoriteBook(bookId);
				setIsFavorite(false);
				Alert.alert('Sucesso', 'Livro removido dos favoritos.');
			} else {
				await addFavoriteBook(bookId);
				setIsFavorite(true);
				Alert.alert('Sucesso', 'Livro adicionado aos favoritos.');
			}
		} catch (error) {
			Alert.alert('Erro', 'Não foi possível atualizar seus favoritos agora.');
		} finally {
			setIsUpdatingFavorite(false);
		}
	};

	return (
		<SafeAreaView style={styles.safeArea} testID="book-details-screen">
			{/* Cabeçalho fixo com navegação de retorno e identidade da tela. */}
			{/* Tecnologias utilizadas: LinearGradient, StatusBar, TouchableOpacity e ícones. */}
			{/* Objetivo: criar um topo forte visualmente e manter saída rápida para a lista. */}
			{/* Observações: o padding respeita a safe area para não colidir com a barra do sistema. */}
			<StatusBar barStyle="light-content" />

			<LinearGradient
				colors={['#6B0F2E', '#0a0f1a', '#003D2B']}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 0 }}
				style={[styles.header, { paddingTop: insets.top + 8 }]}
			>
				<View style={styles.headerOverlay}>
					<TouchableOpacity
						style={styles.backButton}
						onPress={() => navigation.goBack()}
						hitSlop={HIT_SLOP}
						accessibilityRole="button"
						accessibilityLabel="Voltar para a tela anterior"
					>
						<Ionicons name="arrow-back" size={20} color="#fef3c7" />
					</TouchableOpacity>
					<Text style={styles.headerTitle}>Detalhes do Livro</Text>
				</View>
			</LinearGradient>

			{/* Estados de carregamento e erro antes de exibir o conteúdo principal. */}
			{/* Tecnologias utilizadas: renderização condicional e ActivityIndicator. */}
			{/* Objetivo: informar claramente quando os dados ainda estão chegando ou falharam. */}
			{/* Observações: a tela evita mostrar conteúdo parcial sem contexto. */}
			{isLoading ? (
				<View style={styles.centeredContainer}>
					<ActivityIndicator size="large" color="#0f766e" />
					<Text style={styles.feedbackText}>Carregando detalhes...</Text>
				</View>
			) : null}

			{!isLoading && !!errorMessage ? (
				<View style={styles.centeredContainer}>
					<Text style={styles.errorText}>{errorMessage}</Text>
				</View>
			) : null}

			{/* Conteúdo completo do livro com sinopse, autor, avaliações e comentários. */}
			{/* Tecnologias utilizadas: ScrollView, Image, Text, TouchableOpacity e cards. */}
			{/* Objetivo: concentrar a experiência de leitura e interação em uma única página. */}
			{/* Observações: o fluxo depende de book válido para evitar renderização quebrada. */}
			{!isLoading && !errorMessage && book ? (
				<View style={styles.bodyArea}>
					<ScrollView contentContainerStyle={styles.content}>
						{/* Card superior com capa, metadados e ações rápidas. */}
						{/* Tecnologias utilizadas: LinearGradient, Image, Ionicons e badges. */}
						{/* Objetivo: apresentar o livro e permitir favoritar sem rolar a tela. */}
						{/* Observações: a capa usa fallback para não quebrar quando a URL não existe. */}
						{(() => {
							return (
						<LinearGradient
							colors={['#003f2f', '#0f172b', '#0f172b']}
							locations={[0.41, 0.83, 0.93]}
							start={{ x: 0, y: 0 }}
							end={{ x: 0, y: 1 }}
							style={styles.topCard}
						>
							<Image source={{ uri: book.coverUrl || FALLBACK_COVER }} style={styles.cover} resizeMode="cover" />
							<View style={styles.topInfo}>
								<Text style={styles.title}>{book.title || 'Sem título'}</Text>
								<Text style={styles.author}>{book.author || 'Autor não informado'}</Text>
								<View style={[styles.metaChip, {
									backgroundColor: GENRE_CHIP_STYLES[normalizeGenreKey(book.genre)]?.backgroundColor || '#f3f4f6',
									borderColor: GENRE_CHIP_STYLES[normalizeGenreKey(book.genre)]?.borderColor || '#d1d5db',
								}]}>
									<Text style={[styles.metaChipText, {
										color: GENRE_CHIP_STYLES[normalizeGenreKey(book.genre)]?.textColor || '#374151',
									}]}>{book.genre || 'Geral'}</Text>
								</View>
								<View style={styles.metaRow}>
									<Ionicons name="calendar-outline" size={14} color="#FEF3C6" />
									<Text style={styles.metaText}>{book.year || '----'}</Text>
								</View>
								<View style={styles.ratingRow}>
									<View style={{ position: 'relative', width: 16, height: 16 }}>
										<Ionicons name="star" size={16} color="#FFB900" style={{ position: 'absolute' }} />
										<Ionicons name="star-outline" size={16} color="#BB4D00" style={{ position: 'absolute' }} />
									</View>
									<Text style={styles.ratingText}>
										{Number(averageRating || 0).toFixed(1)}
										<Text style={styles.ratingCountText}> ({totalRatings} avaliações)</Text>
									</Text>
								</View>
								<TouchableOpacity
									style={[
										styles.favoriteActionButton,
										isFavorite && styles.favoriteActionButtonActive,
										isUpdatingFavorite && styles.favoriteActionButtonDisabled,
									]}
									onPress={handleToggleFavorite}
									disabled={isUpdatingFavorite}
									accessibilityRole="button"
									accessibilityLabel={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
								>
									<Ionicons
										name={isFavorite ? 'bookmark' : 'bookmark-outline'}
										size={16}
										color={isFavorite ? '#0f172a' : '#fef3c7'}
									/>
									<Text style={[styles.favoriteActionText, isFavorite && styles.favoriteActionTextActive]}>
										{isFavorite ? 'Nos favoritos' : 'Favoritar'}
									</Text>
								</TouchableOpacity>
							</View>
						</LinearGradient>
								);
							})()}

						<View style={styles.contentInner}>
								{/* Bloco de sinopse com texto principal do livro. */}
								{/* Tecnologias utilizadas: View, Text e ícone de seção. */}
								{/* Objetivo: oferecer contexto narrativo antes das avaliações. */}
								{/* Observações: mantém fallback quando o conteúdo ainda não foi cadastrado. */}
							<View style={[styles.sectionCard, styles.synopsisCardOverlap]}>
								<View style={styles.sectionHeaderRow}>
									<Ionicons name="book-outline" size={18} color="#006045" />
									<Text style={styles.sectionTitle}>Sinopse</Text>
								</View>
								<Text style={styles.sectionText}>{book.synopsis || 'Sem sinopse cadastrada.'}</Text>
							</View>

							{/* Bloco com biografia resumida do autor. */}
							{/* Tecnologias utilizadas: View, Text e ícone de seção. */}
							{/* Objetivo: complementar a ficha do livro com informação editorial. */}
							{/* Observações: o fallback evita vazio visual para cadastro incompleto. */}
							<View style={styles.sectionCard}>
								<View style={styles.sectionHeaderRow}>
									<Ionicons name="person-outline" size={18} color="#006045" />
									<Text style={styles.sectionTitle}>Sobre o Autor</Text>
								</View>
								<Text style={styles.sectionText}>{book.authorBio || 'Sem biografia cadastrada.'}</Text>
							</View>

							{/* Resumo estatístico das avaliações da comunidade. */}
							{/* Tecnologias utilizadas: useMemo, distribuição por estrelas e barras de progresso. */}
							{/* Objetivo: mostrar a reputação do livro de forma rápida e comparável. */}
							{/* Observações: a distribuição ajuda a interpretar melhor a média geral. */}
							<View style={styles.sectionCard}>
								<View style={styles.sectionHeaderRow}>
									<Ionicons name="stats-chart-outline" size={18} color="#006045" />
									<Text style={styles.sectionTitle}>Avaliações da comunidade</Text>
								</View>
								<View style={styles.ratingSummaryGrid}>
									<View style={styles.ratingSummaryScore}>
										<Text style={styles.ratingAverageValue}>{ratingSummary.average.toFixed(1)}</Text>
										<View style={styles.ratingAverageStars}>{renderStars(Math.round(ratingSummary.average), 18)}</View>
										<Text style={styles.ratingSummaryText}>
											Baseado em {ratingSummary.total} {ratingSummary.total === 1 ? 'avaliação' : 'avaliações'}
										</Text>
										<Text style={styles.ratingHighlightText}>
											{ratingSummary.highlyRated} {ratingSummary.highlyRated === 1 ? 'avaliação' : 'avaliações'} com 4 estrelas ou mais.
										</Text>
									</View>
									<View style={styles.ratingDistribution}>
										{[5, 4, 3, 2, 1].map((star) => {
											const count = ratingSummary.distribution[star] || 0;
											const percentage = ratingSummary.total ? Math.max(8, (count / ratingSummary.total) * 100) : 0;

											return (
												<View key={star} style={styles.ratingDistributionRow}>
													<Text style={styles.ratingDistributionLabel}>{star}</Text>
													<View style={styles.ratingDistributionTrack}>
														<View style={[styles.ratingDistributionFill, { width: `${percentage}%` }]} />
													</View>
													<Text style={styles.ratingDistributionCount}>{count}</Text>
												</View>
											);
										})}
									</View>
								</View>
							</View>

							{/* Destaques da comunidade com avaliações selecionadas. */}
							{/* Tecnologias utilizadas: featuredRatings, badges e formatação de data. */}
							{/* Objetivo: exibir opiniões relevantes sem poluir a tela com excesso de cards. */}
							{/* Observações: a marcação de "Sua avaliação" melhora orientação do usuário logado. */}
							<View style={styles.sectionCard}>
								<View style={styles.sectionHeaderRow}>
									<Ionicons name="star-outline" size={18} color="#006045" />
									<Text style={styles.sectionTitle}>Destaques da comunidade</Text>
								</View>
								{featuredRatings.length ? (
									<View style={styles.ratingCardsList}>
										{featuredRatings.map((rating) => {
											const isMyRating = Number(rating.userId) === Number(session?.id);
											const reviewText = String(rating.review || '').trim();

											return (
												<View
													key={rating.id || `${rating.userId}-${rating.date || rating.updatedAt || rating.createdAt || rating.rating}`}
													style={[styles.ratingCard, isMyRating && styles.ratingCardCurrent]}
												>
													<View style={styles.ratingCardHeader}>
														<View style={styles.ratingAuthorRow}>
															<Ionicons name="person-circle-outline" size={18} color="#0f766e" />
															<Text style={styles.ratingAuthor}>{getRatingAuthor(rating, session?.id)}</Text>
															{isMyRating ? (
																<View style={styles.ratingBadge}>
																	<Text style={styles.ratingBadgeText}>Sua avaliação</Text>
																</View>
															) : null}
														</View>
														<View
															style={[
																styles.ratingStatusBadge,
																rating.status === 'PENDING' && styles.ratingStatusBadgePending,
																rating.status === 'REJECTED' && styles.ratingStatusBadgeRejected,
															]}
														>
															<Text
																style={[
																	styles.ratingStatusText,
																	rating.status === 'PENDING' && styles.ratingStatusTextPending,
																	rating.status === 'REJECTED' && styles.ratingStatusTextRejected,
																]}
															>
																{getRatingStatusLabel(rating.status)}
															</Text>
														</View>
													</View>

													<View style={styles.ratingMetaRow}>
														<View style={styles.ratingStarsSmall}>{renderStars(rating.rating, 14)}</View>
														<Text style={styles.ratingMetaText}>{formatRatingDate(rating.date || rating.updatedAt || rating.createdAt)}</Text>
													</View>

													{reviewText ? (
														<Text style={styles.ratingReviewText}>{reviewText}</Text>
													) : (
														<Text style={styles.ratingEmptyReviewText}>Sem comentário escrito.</Text>
													)}
												</View>
											);
										})}
									</View>
								) : (
									<Text style={styles.commentsEmptyText}>Ainda não existem avaliações publicadas para este livro.</Text>
								)}
							</View>

							{/* Formulário pessoal de avaliação com estrelas, comentário e ações. */}
							{/* Tecnologias utilizadas: TextInput, TouchableOpacity, Ionicons e Alert. */}
							{/* Objetivo: permitir avaliar, atualizar ou excluir a própria nota. */}
							{/* Observações: o estado pendente informa que a moderação pode atrasar a publicação. */}
							<View style={styles.sectionCard}>
								<View style={styles.sectionHeaderRow}>
									<Ionicons name="create-outline" size={18} color="#006045" />
									<Text style={styles.sectionTitle}>{myExistingRating ? 'Atualize sua avaliação' : 'Sua avaliação'}</Text>
								</View>
								{!isAuthenticated ? (
									<Text style={styles.commentsEmptyText}>Faça login para avaliar este livro.</Text>
								) : (
									<>
										<Text style={styles.ratingHint}>
											Toque nas estrelas para definir sua nota. O comentário ajuda outros leitores a decidir.
										</Text>
										<View style={styles.starsRow}>
											{[1, 2, 3, 4, 5].map((star) => (
												<TouchableOpacity
													key={star}
													onPress={() => setMyRating(star)}
													hitSlop={HIT_SLOP}
													testID={`rating-star-${star}`}
													accessibilityRole="button"
													accessibilityLabel={`Selecionar ${star} estrela${star > 1 ? 's' : ''}`}
												>
													<Ionicons
														name={star <= myRating ? 'star' : 'star-outline'}
														size={30}
														color={star <= myRating ? '#f59e0b' : '#94a3b8'}
													/>
												</TouchableOpacity>
											))}
										</View>
										<Text style={styles.ratingSelectionText}>
											{myRating ? `${myRating} de 5 estrelas selecionadas` : 'Selecione uma nota de 1 a 5 estrelas'}
										</Text>
										<TextInput
											value={myReview}
											onChangeText={setMyReview}
											placeholder="Escreva um comentário opcional sobre o livro"
											placeholderTextColor="#94a3b8"
											multiline
											style={styles.reviewInput}
													testID="rating-review-input"
											accessibilityLabel="Comentário da sua avaliação"
										/>
										{myExistingRating?.status && myExistingRating.status !== 'APPROVED' ? (
											<Text style={styles.ratingPendingText}>
												Sua avaliação está {getRatingStatusLabel(myExistingRating.status).toLowerCase()} e pode demorar um pouco para aparecer para todos.
											</Text>
										) : null}
										<View style={styles.ratingActionsRow}>
											<TouchableOpacity
												style={[styles.ratingActionButton, styles.ratingSaveButton, isSavingRating && styles.ratingButtonDisabled]}
												onPress={handleSaveRating}
												disabled={isSavingRating}
														testID="rating-submit-button"
												accessibilityRole="button"
												accessibilityLabel={myExistingRating ? 'Atualizar avaliação' : 'Salvar avaliação'}
											>
												<Text style={styles.ratingSaveButtonText}>{myExistingRating ? 'Atualizar' : 'Salvar'}</Text>
											</TouchableOpacity>
											{myExistingRating ? (
												<TouchableOpacity
													style={[styles.ratingActionButton, styles.ratingDeleteButton, isSavingRating && styles.ratingButtonDisabled]}
													onPress={handleDeleteRating}
													disabled={isSavingRating}
															testID="rating-delete-button"
													accessibilityRole="button"
													accessibilityLabel="Excluir avaliação"
												>
													<Text style={styles.ratingDeleteButtonText}>Excluir</Text>
												</TouchableOpacity>
											) : null}
										</View>
									</>
								)}
							</View>

							{/* Lista reduzida de comentários da leitura. */}
							{/* Tecnologias utilizadas: memberComments, ícones e cards simples. */}
							{/* Objetivo: destacar trechos da comunidade ligados aos capítulos do livro. */}
							{/* Observações: o limite de itens evita uma rolagem excessiva nessa seção. */}
							<View style={styles.sectionCard}>
								<View style={styles.sectionHeaderRow}>
									<Ionicons name="chatbubble-ellipses-outline" size={18} color="#006045" />
									<Text style={styles.sectionTitle}>Comentários da leitura</Text>
								</View>
								{memberComments.length ? (
									<View style={styles.commentsList}>
										{memberComments.map((comment) => (
											<View key={comment.id} style={styles.commentItem}>
												<View style={styles.commentTopRow}>
													<View style={styles.commentAuthorRow}>
														<Ionicons name="chatbubble-outline" size={14} color="#475569" />
														<Text style={styles.commentAuthor}>{comment.author || 'Membro'}</Text>
													</View>
													<View style={styles.commentStarsRow}>
														<View style={styles.commentStarIconWrapper}>
															<Ionicons name="star" size={12} color="#FFB900" style={{ position: 'absolute' }} />
															<Ionicons name="star-outline" size={12} color="#BB4D00" style={{ position: 'absolute' }} />
														</View>
														<Text style={styles.commentStarsText}>{Number(comment.likes || 0)}</Text>
													</View>
												</View>
												{comment.chapterTitle ? <Text style={styles.commentChapter}>{comment.chapterTitle}</Text> : null}
												<Text style={styles.commentText}>{comment.text || 'Sem comentário.'}</Text>
											</View>
										))}
									</View>
								) : (
										<Text style={styles.commentsEmptyText}>Ainda não existem comentários para este livro.</Text>
								)}
							</View>
						</View>
					</ScrollView>
					<FooterNav navigation={navigation} activeKey="livros" />
				</View>
			) : null}
		</SafeAreaView>
	);
}
