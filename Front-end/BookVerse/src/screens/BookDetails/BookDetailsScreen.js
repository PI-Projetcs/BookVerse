import FooterNav from '../../components/FooterNav';
import { getBookById, getDiscussions } from '../../services/bookService';
import { bookDetailsStyles as styles } from '../../styles/bookDetailsStyles';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    ActivityIndicator,
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { GENRE_CHIP_STYLES, normalizeGenreKey } from '../../constants/genreThemes';

const FALLBACK_COVER = 'https://placehold.co/420x640/0f172a/f8fafc?text=Sem+Capa';
const HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };

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
	const bookId = route?.params?.id;
	const [book, setBook] = useState(null);
	const [memberComments, setMemberComments] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState('');

	useEffect(() => {
		let isMounted = true;

		const loadDetails = async () => {
			try {
				setIsLoading(true);
				setErrorMessage('');
				const [bookResult, discussionsResult] = await Promise.all([
					getBookById(bookId),
					getDiscussions(bookId),
				]);
				if (isMounted) {
					setBook(bookResult || null);
					setMemberComments(extractMemberComments(discussionsResult));
				}
			} catch (error) {
				if (isMounted) {
					setErrorMessage('Não foi possível carregar os detalhes do livro.');
					setMemberComments([]);
				}
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		};

		if (bookId) {
			loadDetails();
		} else {
			setErrorMessage('Livro não encontrado.');
			setIsLoading(false);
		}

		return () => {
			isMounted = false;
		};
	}, [bookId]);

	return (
		<SafeAreaView style={styles.safeArea}>
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
							const totalRatings =
								Number(book.ratingsCount ?? book.ratings_count) ||
								Number(book.reviewsCount ?? book.reviews_count) ||
								memberComments.length;

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
										{Number(book.rating || 0).toFixed(1)}
										<Text style={styles.ratingCountText}> ({totalRatings} avaliações)</Text>
									</Text>
								</View>
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
									<Ionicons name="chatbubble-ellipses-outline" size={18} color="#006045" />
									<Text style={styles.sectionTitle}>Comentários dos Membros</Text>
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
