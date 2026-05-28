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

/*
 * Tela de detalhes do livro
 * - Mostra informações do livro, sinopse, biografia do autor, avaliações
 *   e comentários destacados.
 * - Permite favoritar, avaliar e gerenciar resenhas; carrega dados de
 *   discussões, avaliações e preferências do usuário quando autenticado.
 */
const FALLBACK_COVER = 'https://placehold.co/420x640/0f172a/f8fafc?text=Sem+Capa';
const HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };

// Renderiza ícones de estrela para valores de avaliação (0-5)
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

	const myExistingRating = useMemo(() => {
		if (!session?.id) {
			return null;
		}

		return ratings.find((item) => Number(item.userId) === Number(session.id)) || null;
	}, [ratings, session?.id]);

	const approvedRatings = useMemo(
		() => ratings.filter((item) => !item?.status || item.status === 'APPROVED'),
		[ratings]
	);

	const averageRating = useMemo(() => {
		if (!approvedRatings.length) {
			return Number(book?.rating || 0);
		}

		const sum = approvedRatings.reduce((acc, item) => acc + Number(item?.rating || 0), 0);
		return sum / approvedRatings.length;
	}, [approvedRatings, book?.rating]);

	const totalRatings = approvedRatings.length;

	const ratingSummary = useMemo(() => {
 	return renderRatingDistribution(approvedRatings);
	}, [approvedRatings]);

	const featuredRatings = useMemo(() => {
		return pickFeaturedRatings(approvedRatings);
	}, [approvedRatings]);

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

	useEffect(() => {
		if (bookId) {
			loadDetails();
		} else {
			setErrorMessage('Livro não encontrado.');
			setIsLoading(false);
		}
	}, [bookId, loadDetails]);

	useEffect(() => {
		if (myExistingRating) {
			setMyRating(Number(myExistingRating.rating || 0));
			setMyReview(myExistingRating.review || '');
			return;
		}

		setMyRating(0);
		setMyReview('');
	}, [myExistingRating]);

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

			{!isLoading && !errorMessage && book ? (
				<View style={styles.bodyArea}>
					<ScrollView contentContainerStyle={styles.content}>
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
							<View style={[styles.sectionCard, styles.synopsisCardOverlap]}>
								<View style={styles.sectionHeaderRow}>
									<Ionicons name="book-outline" size={18} color="#006045" />
									<Text style={styles.sectionTitle}>Sinopse</Text>
								</View>
								<Text style={styles.sectionText}>{book.synopsis || 'Sem sinopse cadastrada.'}</Text>
							</View>

							<View style={styles.sectionCard}>
								<View style={styles.sectionHeaderRow}>
									<Ionicons name="person-outline" size={18} color="#006045" />
									<Text style={styles.sectionTitle}>Sobre o Autor</Text>
								</View>
								<Text style={styles.sectionText}>{book.authorBio || 'Sem biografia cadastrada.'}</Text>
							</View>

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
