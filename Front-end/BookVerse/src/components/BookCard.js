import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { bookCardStyles as styles } from '../styles/bookCardStyles';
import { GENRE_CHIP_STYLES, normalizeGenreKey } from '../constants/genreThemes';

const FALLBACK_COVER = 'https://placehold.co/300x450/0f172a/f8fafc?text=Sem+Capa';
const HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };

export default function BookCard({ book, onPress }) {
	const genreLabel = book?.genre || '';
	const genreTheme = GENRE_CHIP_STYLES[normalizeGenreKey(genreLabel)] || null;
	const genreChipStyle = genreTheme
		? { backgroundColor: genreTheme.backgroundColor, borderColor: genreTheme.borderColor }
		: null;
	const genreTextStyle = genreTheme ? { color: genreTheme.textColor } : null;
	const title = book?.title || 'Sem título';
	const author = book?.author || 'Autor não informado';

	return (
		<TouchableOpacity
			style={styles.card}
			activeOpacity={0.88}
			onPress={() => onPress?.(book)}
			hitSlop={HIT_SLOP}
			accessibilityRole="button"
			accessibilityLabel={`Abrir detalhes do livro ${title}, de ${author}`}
			accessibilityHint="Abre a tela com informações completas do livro"
		>
			<Image source={{ uri: book?.coverUrl || FALLBACK_COVER }} style={styles.cover} resizeMode="cover" />
			<View style={styles.content}>
				<Text style={styles.year}>{book?.year || '----'}</Text>
				<Text style={styles.title} numberOfLines={2}>
					{title}
				</Text>
				<Text style={styles.author} numberOfLines={1}>
					{author}
				</Text>

				<View style={styles.footerRow}>
					{genreTheme ? (
						<View style={[styles.genreChip, genreChipStyle]}>
							<Text style={[styles.genreText, genreTextStyle]} numberOfLines={1}>
								{genreLabel}
							</Text>
						</View>
					) : (
						<View style={styles.genreChipSpacer} />
					)}
					<View style={styles.ratingRow}>
					<View style={{ position: 'relative', width: 12, height: 12 }}>
						<Ionicons name="star" size={12} color="#FFB900" style={{ position: 'absolute' }} />
						<Ionicons name="star-outline" size={12} color="#BB4D00" style={{ position: 'absolute' }} />
					</View>
						<Text style={styles.ratingText}>{Number(book?.rating || 0).toFixed(1)}</Text>
					</View>
				</View>
			</View>
		</TouchableOpacity>
	);
}
