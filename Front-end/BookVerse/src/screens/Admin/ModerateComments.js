import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
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
  approveComment,
  approveRating,
  getModerationItems,
  rejectComment,
  rejectRating,
} from '../../services/adminService';
import { adminModerationStyles as styles } from '../../styles/adminModerationStyles';

const STATUS_FILTERS = [
  { key: 'pending', label: 'Pendentes' },
  { key: 'approved', label: 'Aprovados' },
  { key: 'rejected', label: 'Rejeitados' },
  { key: 'all', label: 'Todos' },
];
const MODERATION_TYPES = {
  comment: {
    title: 'Moderar comentários',
    subtitle: 'Moderar comentários',
    footerKey: 'moderarComentarios',
    summaryLabel: 'comentários',
    emptyText: 'Nenhum comentário nessa fila de moderação.',
    searchPlaceholder: 'Buscar por autor, livro ou motivo',
    searchAccessibility: 'Buscar comentários para moderação',
    approveLabel: 'comentário',
    approveAction: approveComment,
    rejectAction: rejectComment,
    requiresFeedback: true,
  },
  rating: {
    title: 'Moderar avaliações',
    subtitle: 'Moderar avaliações',
    footerKey: 'moderarAvaliacoes',
    summaryLabel: 'avaliações',
    emptyText: 'Nenhuma avaliação nessa fila de moderação.',
    searchPlaceholder: 'Buscar por autor, livro ou nota',
    searchAccessibility: 'Buscar avaliações para moderação',
    approveLabel: 'avaliação',
    approveAction: approveRating,
    rejectAction: rejectRating,
    requiresFeedback: true,
  },
};
const HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };

/*
 * Tela de Moderação (Admin)
 * - Lista itens para moderação (comentários e avaliações), permite aprovar
 *   ou rejeitar com feedback, e integra com os métodos de `adminService`.
 * - Fornece filtros por status e busca, e apresenta ações seguras com
 *   confirmações e feedback ao usuário.
 */

function getItemBadgeStyle(status) {
  if (status === 'approved') {
    return {
      container: { backgroundColor: '#ecfeff', borderColor: '#67e8f9' },
      text: { color: '#0f766e' },
      label: 'Aprovado',
    };
  }

  if (status === 'rejected') {
    return {
      container: { backgroundColor: '#fef2f2', borderColor: '#fda4af' },
      text: { color: '#9f1239' },
      label: 'Rejeitado',
    };
  }

  return {
    container: { backgroundColor: '#fff7ed', borderColor: '#fdba74' },
    text: { color: '#9a3412' },
    label: 'Pendente',
  };
}

export default function ModerateComments({ navigation, route }) {
  const moderationType = route?.params?.moderationType === 'rating' ? 'rating' : 'comment';
  const moderationConfig = MODERATION_TYPES[moderationType];
  const activeKey = moderationConfig.footerKey;
  const [items, setItems] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadItems = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const result = await getModerationItems({ query: searchText, status: statusFilter });
      setItems(result.filter((item) => item.type === moderationType));
    } catch (error) {
      setErrorMessage('Não foi possível carregar a fila de moderação.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(loadItems, 220);
    return () => clearTimeout(timer);
  }, [searchText, statusFilter, moderationType]);

  const summaryText = useMemo(
    () => `${items.length} ${moderationConfig.summaryLabel} na lista`,
    [items.length, moderationConfig.summaryLabel]
  );

  const handleSetStatus = async (item, status) => {
    if (status === 'approved') {
      try {
        const updated = await moderationConfig.approveAction(item.id);
        setItems((prev) => prev.map((entry) => (entry.id === updated.id ? updated : entry)));
      } catch (err) {
        // tratar erro
      }
      return;
    }

    if (status === 'rejected') {
      // abrir modal para coletar feedback
      setCurrentRejectItem(item);
      setShowRejectModal(true);
      return;
    }

    return;
  };

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [currentRejectItem, setCurrentRejectItem] = useState(null);
  const [rejectFeedback, setRejectFeedback] = useState('');

  const handleConfirmReject = async () => {
    if (!currentRejectItem) return;
    try {
      const updated = await moderationConfig.rejectAction(currentRejectItem.id, rejectFeedback.trim());
      setItems((prev) => prev.map((entry) => (entry.id === updated.id ? updated : entry)));
    } catch (err) {
      // tratar erro
    } finally {
      setShowRejectModal(false);
      setCurrentRejectItem(null);
      setRejectFeedback('');
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />
      <Header
        title="BookV"
        subtitle={moderationConfig.subtitle}
        onRightAction={() => navigation.navigate('Admin')}
        rightActionLabel="Painel"
        rightActionIcon="grid-outline"
      />

      <View style={styles.content}>
        <View style={styles.filtersWrap}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color="#64748b" />
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder={moderationConfig.searchPlaceholder}
              placeholderTextColor="#94a3b8"
              style={styles.searchInput}
              accessibilityLabel={moderationConfig.searchAccessibility}
            />
          </View>

          <View style={styles.chipRow}>
            {STATUS_FILTERS.map((filter) => {
              const isActive = statusFilter === filter.key;
              return (
                <TouchableOpacity
                  key={filter.key}
                  style={[styles.chip, isActive && styles.chipActive]}
                  onPress={() => setStatusFilter(filter.key)}
                  hitSlop={HIT_SLOP}
                  accessibilityRole="button"
                  accessibilityLabel={`Filtrar ${moderationConfig.summaryLabel} ${filter.label.toLowerCase()}`}
                  accessibilityState={{ selected: isActive }}
                >
                  <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{filter.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.metaText}>{summaryText}</Text>
        </View>

        {isLoading ? (
          <View style={styles.feedbackWrap}>
            <ActivityIndicator size="large" color="#0f766e" />
            <Text style={styles.feedbackText}>Carregando moderação...</Text>
          </View>
        ) : null}

        {!isLoading && !!errorMessage ? (
          <View style={styles.feedbackWrap}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {!isLoading && !errorMessage ? (
          <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
            {items.map((item) => {
              const badge = getItemBadgeStyle(item.status);
              return (
                <View key={item.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.title} numberOfLines={2}>
                      {item.type === 'comment' && item.chapterTitle ? `${item.bookTitle} - ${item.chapterTitle}` : item.bookTitle}
                    </Text>
                    <View style={[styles.badge, badge.container]}>
                      <Text style={[styles.badgeText, badge.text]}>{badge.label}</Text>
                    </View>
                  </View>
                  <Text style={styles.metaTextRow}>Autor: {item.author}</Text>
                  <Text style={styles.metaTextRow}>Data: {item.date}</Text>
                  {item.type === 'rating' && item.rating != null ? (
                    <Text style={styles.metaTextRow}>Nota: {item.rating}</Text>
                  ) : null}
                  <Text style={styles.commentText}>{item.text}</Text>
                  <View style={styles.reasonChip}>
                    <Text style={styles.reasonText}>Motivo: {item.reason}</Text>
                  </View>

                  <View style={styles.actionsRow}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.actionButtonApprove]}
                      onPress={() => handleSetStatus(item, 'approved')}
                      hitSlop={HIT_SLOP}
                      accessibilityRole="button"
                      accessibilityLabel={`Aprovar ${moderationConfig.approveLabel} de ${item.author}`}
                    >
                      <Ionicons name="checkmark-circle-outline" size={14} color="#0f766e" />
                      <Text style={[styles.actionText, { color: '#0f766e' }]}>Aprovar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, styles.actionButtonReject]}
                      onPress={() => handleSetStatus(item, 'rejected')}
                      hitSlop={HIT_SLOP}
                      accessibilityRole="button"
                      accessibilityLabel={`Rejeitar ${moderationConfig.approveLabel} de ${item.author}`}
                    >
                      <Ionicons name="close-circle-outline" size={14} color="#9f1239" />
                      <Text style={[styles.actionText, { color: '#9f1239' }]}>Rejeitar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}

            {items.length === 0 ? (
              <View style={styles.feedbackWrap}>
                <Ionicons name="chatbubble-ellipses-outline" size={28} color="#94a3b8" />
                <Text style={styles.feedbackText}>{moderationConfig.emptyText}</Text>
              </View>
            ) : null}
          </ScrollView>
        ) : null}
      </View>

      <FooterNav navigation={navigation} activeKey={activeKey} items={ADMIN_FOOTER_ITEMS} />

      {/* Reject feedback modal */}
      {showRejectModal ? (
        <View style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)',
          alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <View style={{ width: '100%', maxWidth: 620, backgroundColor: '#fff', borderRadius: 12, padding: 16 }}>
            <Text style={{ fontWeight: '800', fontSize: 16, marginBottom: 8 }}>
              Rejeitar {moderationConfig.approveLabel}
            </Text>
            <Text style={{ color: '#64748b', marginBottom: 8 }}>Informe um motivo ou orientação que será enviado ao autor (visível apenas para ele).</Text>
            <TextInput
              value={rejectFeedback}
              onChangeText={setRejectFeedback}
              placeholder="Digite o feedback ao autor"
              style={{ minHeight: 80, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 10, textAlignVertical: 'top' }}
              multiline
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
              <TouchableOpacity onPress={() => { setShowRejectModal(false); setCurrentRejectItem(null); setRejectFeedback(''); }} style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
                <Text style={{ color: '#64748b', fontWeight: '700' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleConfirmReject} style={{ paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#9f1239', borderRadius: 8 }}>
                <Text style={{ color: '#fff', fontWeight: '800' }}>Confirmar rejeição</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}