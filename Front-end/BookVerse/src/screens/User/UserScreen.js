import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import FooterNav from '../../components/FooterNav';
import { HEADER_GRADIENT_COLORS } from '../../styles/headerStyles';
import { styles as userStyles } from '../../styles/UserStyles';
import { useAuth } from '../../context/AuthContext';
import {
  deactivateOwnAccount,
  getDetailedUserProfile,
  removeFavoriteBook,
} from '../../services/profileService';

const HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };

function getProfileRoleLabel(role) {
  const normalized = String(role || '').trim().toLowerCase();
  if (normalized === 'admin') return 'Administrador';
  if (normalized === 'member') return 'Membro';
  return role || 'Leitor(a)';
}

function formatNumber(value) {
  return String(Number.isFinite(Number(value)) ? Number(value) : 0).padStart(2, '0');
}

function SectionCard({ title, subtitle, actionLabel, onAction, children }) {
  return (
    <View style={screenStyles.sectionCard}>
      <View style={screenStyles.sectionHeader}>
        <View style={{ flex: 1 }}>
          <Text style={screenStyles.sectionTitle}>{title}</Text>
          {subtitle ? <Text style={screenStyles.sectionSubtitle}>{subtitle}</Text> : null}
        </View>
        {onAction && actionLabel ? (
          <TouchableOpacity onPress={onAction} hitSlop={HIT_SLOP}>
            <Text style={screenStyles.sectionAction}>{actionLabel}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {children}
    </View>
  );
}

function StatPill({ icon, label, value, color = '#7D1F3E' }) {
  return (
    <View style={userStyles.statCard}>
      <View style={[userStyles.statIconWrap, { backgroundColor: `${color}1A` }]}>
        <Ionicons name={icon} size={16} color={color} />
      </View>
      <Text style={userStyles.statValue}>{formatNumber(value)}</Text>
      <Text style={userStyles.statLabel}>{label}</Text>
    </View>
  );
}

function EmptyState({ icon, title, description }) {
  return (
    <View style={screenStyles.emptyState}>
      <Ionicons name={icon} size={24} color="#94a3b8" />
      <Text style={screenStyles.emptyTitle}>{title}</Text>
      <Text style={screenStyles.emptyDescription}>{description}</Text>
    </View>
  );
}

function FavoriteCard({ book, onPress, onRemove }) {
  return (
    <TouchableOpacity style={screenStyles.favoriteCard} onPress={onPress} activeOpacity={0.9}>
      <View style={screenStyles.favoriteCover}>
        <Ionicons name="book-outline" size={24} color="#fff7ed" />
      </View>
      <Text numberOfLines={2} style={screenStyles.favoriteTitle}>{book?.title || 'Livro'}</Text>
      <Text numberOfLines={1} style={screenStyles.favoriteAuthor}>{book?.author || 'Autor desconhecido'}</Text>
      <View style={screenStyles.favoriteMetaRow}>
        <View style={screenStyles.favoriteTag}>
          <Text style={screenStyles.favoriteTagText}>{book?.genre || 'Favorito'}</Text>
        </View>
        {onRemove ? (
          <TouchableOpacity onPress={onRemove} hitSlop={HIT_SLOP} accessibilityRole="button">
            <Ionicons name="trash-outline" size={16} color="#991b1b" />
          </TouchableOpacity>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

function ReadingRow({ item }) {
  const percent = Math.max(0, Math.min(100, Number(item?.progress) || 0));
  return (
    <View style={screenStyles.listRow}>
      <View style={{ flex: 1 }}>
        <Text style={screenStyles.listRowTitle} numberOfLines={1}>{item?.bookTitle || 'Livro lido'}</Text>
        <Text style={screenStyles.listRowSubtitle}>{item?.bookAuthor || 'Sem autor'}</Text>
      </View>
      <View style={screenStyles.rowRight}>
        <Text style={screenStyles.rowBadge}>{String(item?.status || 'UNKNOWN').replace(/_/g, ' ')}</Text>
        <Text style={screenStyles.rowPercent}>{percent}%</Text>
      </View>
    </View>
  );
}

function RatingRow({ item, onPressBook }) {
  return (
    <TouchableOpacity style={screenStyles.ratingCard} onPress={onPressBook} activeOpacity={0.9}>
      <View style={screenStyles.ratingTopRow}>
        <Text style={screenStyles.ratingBookTitle} numberOfLines={1}>{item?.bookTitle || 'Avaliação'}</Text>
        <View style={screenStyles.ratingScore}>
          <Ionicons name="star" size={12} color="#B8941F" />
          <Text style={screenStyles.ratingScoreText}>{item?.note ?? 0}</Text>
        </View>
      </View>
      <Text style={screenStyles.ratingReview} numberOfLines={3}>
        {item?.review || 'Sem comentário.'}
      </Text>
      {item?.status ? <Text style={screenStyles.ratingStatus}>Status: {item.status}</Text> : null}
    </TouchableOpacity>
  );
}

function AchievementBadge({ item }) {
  return (
    <View style={screenStyles.achievementBadge}>
      <Ionicons name="ribbon-outline" size={16} color="#0f766e" />
      <Text style={screenStyles.achievementName} numberOfLines={1}>{item?.name || 'Conquista'}</Text>
      {item?.description ? <Text style={screenStyles.achievementDescription} numberOfLines={2}>{item.description}</Text> : null}
    </View>
  );
}

export default function UserScreen({ navigation }) {
  const { session, signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadProfile = async () => {
    try {
      setError(null);
      const data = await getDetailedUserProfile();
      setProfile(data);
    } catch (err) {
      setError('Falha ao carregar o perfil.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
  };

  const handleLogout = async () => {
    await signOut();
  };

  const handleDeactivateOwnAccount = () => {
    Alert.alert(
      'Excluir conta',
      'Deseja excluir sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deactivateOwnAccount();
              await signOut();
            } catch (err) {
              Alert.alert('Erro', 'Falha ao excluir conta.');
            }
          },
        },
      ]
    );
  };

  const handleOpenBook = (bookId) => {
    if (!bookId) {
      return;
    }

    navigation.navigate('BookDetails', { id: bookId });
  };

  const handleRemoveFavorite = (book) => {
    if (!book?.id) {
      return;
    }

    Alert.alert(
      'Remover favorito',
      `Remover ${book.title} dos favoritos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              const updated = await removeFavoriteBook(book.id);
              setProfile(updated);
            } catch (err) {
              Alert.alert('Erro', 'Não foi possível remover o favorito.');
            }
          },
        },
      ]
    );
  };

  const favoriteBooks = profile?.favoriteBooks || [];
  const readBooks = profile?.readBooks || [];
  const ratings = profile?.ratings || [];
  const achievements = profile?.achievements || [];
  const stats = profile?.stats || {};

  return (
    <View style={userStyles.screen}>
      <StatusBar barStyle="light-content" />
      <Header
        title="BookV"
        subtitle="Perfil"
        colors={HEADER_GRADIENT_COLORS}
        onRightAction={handleLogout}
        rightActionLabel="Sair"
      />

      <View style={userStyles.content}>
        {loading ? (
          <View style={screenStyles.centerState}>
            <ActivityIndicator size="large" color="#0f766e" />
            <Text style={screenStyles.centerStateText}>Carregando perfil...</Text>
          </View>
        ) : error ? (
          <View style={screenStyles.centerState}>
            <Ionicons name="alert-circle-outline" size={28} color="#9f1239" />
            <Text style={screenStyles.centerStateText}>{error}</Text>
            <TouchableOpacity style={screenStyles.retryButton} onPress={loadProfile}>
              <Text style={screenStyles.retryButtonText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={userStyles.contentInner}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#0f766e" />}
          >
            <View style={userStyles.profileCard}>
              <View style={[userStyles.avatar, screenStyles.avatarFallback]}>
                <Ionicons name="person-outline" size={30} color="#ffffff" />
              </View>
              <View style={userStyles.profileInfo}>
                <Text style={userStyles.profileName}>{profile?.name || session?.name || 'Leitor(a)'}</Text>
                <Text style={userStyles.profileUsername}>{profile?.email || session?.email || 'Sem email'}</Text>
                <Text style={userStyles.profileBio}>Perfil: {getProfileRoleLabel(profile?.role || session?.role)}</Text>
              </View>
            </View>

            <View style={userStyles.statsContainer}>
              <StatPill icon="book-outline" label="Lidos" value={stats.livrosLidos ?? readBooks.length} color="#0f766e" />
              <StatPill icon="bookmark-outline" label="Favoritos" value={stats.favoritos ?? favoriteBooks.length} color="#7D1F3E" />
              <StatPill icon="star-outline" label="Avaliações" value={stats.resenhas ?? ratings.length} color="#B8941F" />
              <StatPill icon="ribbon-outline" label="Conquistas" value={stats.conquistas ?? achievements.length} color="#1e3a5f" />
            </View>

            <SectionCard title="Conta" subtitle="Ações e atalhos do seu perfil">
              <TouchableOpacity
                style={[screenStyles.actionRow, { marginTop: 4 }]}
                onPress={() => navigation.navigate('MyModeration')}
                hitSlop={HIT_SLOP}
                accessibilityRole="button"
                accessibilityLabel="Ver feedbacks de moderação"
              >
                <View style={[screenStyles.actionIcon, { backgroundColor: 'rgba(15,118,110,0.12)' }]}>
                  <Ionicons name="chatbubble-ellipses-outline" size={16} color="#0f766e" />
                </View>
                <Text style={screenStyles.actionLabel}>Meus feedbacks de moderação</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[screenStyles.actionRow, { marginTop: 10 }]}
                onPress={handleLogout}
                hitSlop={HIT_SLOP}
                accessibilityRole="button"
                accessibilityLabel="Sair da conta"
              >
                <View style={[screenStyles.actionIcon, { backgroundColor: 'rgba(125,31,62,0.12)' }]}>
                  <Ionicons name="log-out-outline" size={16} color="#7D1F3E" />
                </View>
                <Text style={screenStyles.actionLabel}>Sair</Text>
              </TouchableOpacity>

              {session?.role !== 'admin' ? (
                <TouchableOpacity
                  style={[screenStyles.actionRow, { marginTop: 10, borderColor: '#fecaca', backgroundColor: '#fff1f2' }]}
                  onPress={handleDeactivateOwnAccount}
                  hitSlop={HIT_SLOP}
                  accessibilityRole="button"
                  accessibilityLabel="Excluir minha conta"
                >
                  <View style={[screenStyles.actionIcon, { backgroundColor: 'rgba(185,28,28,0.12)' }]}>
                    <Ionicons name="trash-outline" size={16} color="#b91c1c" />
                  </View>
                  <Text style={[screenStyles.actionLabel, { color: '#991b1b' }]}>Excluir conta</Text>
                </TouchableOpacity>
              ) : null}
            </SectionCard>

            <SectionCard title="Favoritos" subtitle="Até 3 livros fixados no seu perfil">
              {favoriteBooks.length === 0 ? (
                <EmptyState
                  icon="bookmark-outline"
                  title="Nenhum favorito salvo"
                  description="Adicione até três livros para destacar no perfil."
                />
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={screenStyles.horizontalList}>
                  {favoriteBooks.map((book) => (
                    <FavoriteCard
                      key={String(book.id)}
                      book={book}
                      onPress={() => handleOpenBook(book.id)}
                      onRemove={() => handleRemoveFavorite(book)}
                    />
                  ))}
                </ScrollView>
              )}
            </SectionCard>

            <SectionCard title="Livros lidos" subtitle="Histórico do que já passou pelo seu perfil">
              {readBooks.length === 0 ? (
                <EmptyState
                  icon="book-outline"
                  title="Sem livros lidos"
                  description="Os livros concluídos aparecerão aqui automaticamente."
                />
              ) : (
                <View style={screenStyles.listStack}>
                  {readBooks.slice(0, 5).map((item) => (
                    <ReadingRow key={String(item.id)} item={item} />
                  ))}
                </View>
              )}
            </SectionCard>

            <SectionCard title="Avaliações" subtitle="As últimas avaliações publicadas por você">
              {ratings.length === 0 ? (
                <EmptyState
                  icon="star-outline"
                  title="Sem avaliações"
                  description="Quando você avaliar livros, elas serão exibidas aqui."
                />
              ) : (
                <View style={screenStyles.listStack}>
                  {ratings.slice(0, 5).map((item) => (
                    <RatingRow
                      key={String(item.id)}
                      item={item}
                      onPressBook={() => handleOpenBook(item.bookId)}
                    />
                  ))}
                </View>
              )}
            </SectionCard>

            <SectionCard title="Conquistas" subtitle="Badges desbloqueados no BookVerse">
              {achievements.length === 0 ? (
                <EmptyState
                  icon="ribbon-outline"
                  title="Nenhuma conquista"
                  description="As conquistas desbloqueadas aparecem nesta seção."
                />
              ) : (
                <View style={screenStyles.achievementsGrid}>
                  {achievements.map((item) => (
                    <AchievementBadge key={String(item.id)} item={item} />
                  ))}
                </View>
              )}
            </SectionCard>

            <View style={{ height: 12 }} />
          </ScrollView>
        )}
      </View>

      <FooterNav navigation={navigation} activeKey="perfil" />
    </View>
  );
}

const screenStyles = StyleSheet.create({
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  centerStateText: {
    marginTop: 10,
    color: '#475569',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 14,
    backgroundColor: '#0f766e',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '800',
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7D1F3E',
    borderColor: '#7D1F3E',
  },
  sectionCard: {
    ...userStyles.card,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  sectionSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: '#64748b',
  },
  sectionAction: {
    color: '#7D1F3E',
    fontWeight: '800',
    fontSize: 12,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#fff',
  },
  actionIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  horizontalList: {
    paddingRight: 6,
    gap: 12,
  },
  favoriteCard: {
    width: 180,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
    marginRight: 12,
  },
  favoriteCover: {
    height: 88,
    borderRadius: 12,
    backgroundColor: '#7D1F3E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  favoriteTitle: {
    fontWeight: '800',
    color: '#111827',
    fontSize: 13,
    minHeight: 34,
  },
  favoriteAuthor: {
    marginTop: 4,
    color: '#64748b',
    fontSize: 11,
  },
  favoriteMetaRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  favoriteTag: {
    backgroundColor: 'rgba(15,118,110,0.12)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    maxWidth: 120,
  },
  favoriteTagText: {
    color: '#0f766e',
    fontSize: 10,
    fontWeight: '800',
  },
  listStack: {
    gap: 10,
  },
  listRow: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  listRowTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  listRowSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
  },
  rowRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  rowBadge: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    color: '#334155',
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    textTransform: 'uppercase',
  },
  rowPercent: {
    color: '#0f766e',
    fontWeight: '800',
    fontSize: 12,
  },
  ratingCard: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#fff',
  },
  ratingTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  ratingBookTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  ratingScore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff7ed',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  ratingScoreText: {
    color: '#9a3412',
    fontWeight: '800',
    fontSize: 11,
  },
  ratingReview: {
    marginTop: 10,
    color: '#334155',
    fontSize: 12,
    lineHeight: 18,
  },
  ratingStatus: {
    marginTop: 8,
    color: '#64748b',
    fontSize: 11,
    fontWeight: '700',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  achievementBadge: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#d1fae5',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#f0fdfa',
  },
  achievementName: {
    marginTop: 8,
    fontWeight: '800',
    fontSize: 12,
    color: '#0f172a',
  },
  achievementDescription: {
    marginTop: 4,
    color: '#334155',
    fontSize: 10,
    lineHeight: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 8,
  },
  emptyTitle: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  emptyDescription: {
    marginTop: 4,
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 16,
  },
});