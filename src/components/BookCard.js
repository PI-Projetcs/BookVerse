import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { bookCardStyles as styles } from '../styles/bookCardStyles';
import { GENRE_CHIP_STYLES, normalizeGenreKey } from '../constants/genreThemes';

const FALLBACK_COVER = 'https://placehold.co/300x450/0f172a/f8fafc?text=Sem+Capa';

export default function BookCard({ book, onPress }) {
	const genreLabel = book?.genre || '';
	const genreTheme = GENRE_CHIP_STYLES[normalizeGenreKey(genreLabel)] || null;
	const genreChipStyle = genreTheme
		? { backgroundColor: genreTheme.backgroundColor, borderColor: genreTheme.borderColor }
		: null;
	const genreTextStyle = genreTheme ? { color: genreTheme.textColor } : null;

	return (
		<TouchableOpacity style={styles.card} activeOpacity={0.88} onPress={() => onPress?.(book)}>
			<Image source={{ uri: book?.coverUrl || FALLBACK_COVER }} style={styles.cover} resizeMode="cover" />
			<View style={styles.content}>
				<Text style={styles.year}>{book?.year || '----'}</Text>
				<Text style={styles.title} numberOfLines={2}>
					{book?.title || 'Sem titulo'}
				</Text>
				<Text style={styles.author} numberOfLines={1}>
					{book?.author || 'Autor nao informado'}
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
