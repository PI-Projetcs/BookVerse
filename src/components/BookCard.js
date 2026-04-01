import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { bookCardStyles as styles } from '../styles/bookCardStyles';

const FALLBACK_COVER = 'https://placehold.co/300x450/0f172a/f8fafc?text=Sem+Capa';

export default function BookCard({ book, onPress }) {
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
					<View style={styles.genreChip}>
						<Text style={styles.genreText} numberOfLines={1}>
							{book?.genre || 'Geral'}
						</Text>
					</View>
					<View style={styles.ratingRow}>
						<Ionicons name="star" size={12} color="#f59e0b" />
						<Text style={styles.ratingText}>{Number(book?.rating || 0).toFixed(1)}</Text>
					</View>
				</View>
			</View>
		</TouchableOpacity>
	);
}
