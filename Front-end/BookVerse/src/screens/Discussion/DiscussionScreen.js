import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import styles from '../../styles/discussionStyles';
import FooterNav from '../../components/FooterNav';
import { getBookById, getDiscussions, createChapterComment, createDiscussionForChapter } from '../../services/bookService';

// Espaço mínimo de toque para controles da tela.
// Tecnologias utilizadas: propriedade hitSlop do React Native.
// Objetivo: facilitar interação com botões pequenos em telas de discussão.
// Observações: melhora acessibilidade sem alterar a composição visual.
const HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };

// Tela de discussões do livro.
// Tecnologias utilizadas: React Native, Expo Vector Icons, LinearGradient, serviços de livro.
// Objetivo: reunir capítulos, comentários e ações de participação em um único fórum.
// Observações: a tela combina carregamento inicial, atualização manual e envio com feedback.
export default function DiscussionScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const bookId = Number(route?.params?.bookId) || 1;
  const initialChapterId = Number(route?.params?.chapterId);
  const [selectedFilter, setSelectedFilter] = useState('recentes');
  const [expandedThreads, setExpandedThreads] = useState({});
  const [newComments, setNewComments] = useState({});
  const [book, setBook] = useState(null);
  const [threads, setThreads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Converte o status interno do comentário em rótulo e cores legíveis.
  // Tecnologias utilizadas: função pura e normalização de string.
  // Objetivo: exibir o estado de aprovação sem depender de códigos brutos.
  // Observações: o retorno nulo evita chip visual quando o status é desconhecido.
  const getCommentStatusMeta = (status) => {
    const normalized = String(status || '').toUpperCase();
    if (normalized === 'APPROVED') {
      return { label: 'Aprovado', bg: '#ecfeff', border: '#67e8f9', color: '#0f766e' };
    }
    if (normalized === 'PENDING') {
      return { label: 'Pendente', bg: '#fff7ed', border: '#fdba74', color: '#9a3412' };
    }
    if (normalized === 'REJECTED') {
      return { label: 'Rejeitado', bg: '#fef2f2', border: '#fda4af', color: '#9f1239' };
    }
    return null;
  };

  // Carrega livro e discussões em paralelo e monta as threads da tela.
  // Tecnologias utilizadas: useEffect, Promise.all e serviços de backend.
  // Objetivo: juntar capítulos do livro com discussões já existentes.
  // Observações: o controle de montagem evita atualizar estado após unmount.
  useEffect(() => {
    let isMounted = true;

    const loadDiscussions = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');
        const [bookResult, discussionsResult] = await Promise.all([
          getBookById(bookId),
          getDiscussions(bookId),
        ]);
        if (!isMounted) {
          return;
        }

        const safeBook = bookResult || null;
        const bookChapters = Array.isArray(safeBook?.chapters) ? safeBook.chapters : [];
        const safeDiscussions = Array.isArray(discussionsResult) ? discussionsResult : [];

        const mergedThreads = bookChapters.map((chapter, index) => {
          const discussion = safeDiscussions[index] || null;
          return {
            id: discussion?.id || chapter.id || index + 1,
            chapterId: Number(chapter.id) || index + 1,
            chapterTitle: chapter.title || `Capítulo ${index + 1}`,
            discussionId: discussion?.id || null,
            discussionTitle: discussion?.title || chapter.title || `Capítulo ${index + 1}`,
            discussionDescription: discussion?.description || '',
            comments: Array.isArray(discussion?.comments) ? discussion.comments : [],
          };
        });

        if (safeDiscussions.length > bookChapters.length) {
          safeDiscussions.slice(bookChapters.length).forEach((discussion, extraIndex) => {
            mergedThreads.push({
              id: discussion.id || bookChapters.length + extraIndex + 1,
              chapterId: null,
              chapterTitle: discussion.title || `Discussão ${bookChapters.length + extraIndex + 1}`,
              discussionId: discussion.id || null,
              discussionTitle: discussion.title || `Discussão ${bookChapters.length + extraIndex + 1}`,
              discussionDescription: discussion.description || '',
              comments: Array.isArray(discussion.comments) ? discussion.comments : [],
            });
          });
        }

        setBook(safeBook);
        setThreads(mergedThreads);

        const initialExpanded = mergedThreads.reduce((accumulator, thread) => {
          accumulator[thread.id] =
            thread.chapterId === initialChapterId || thread.discussionId === initialChapterId;
          return accumulator;
        }, {});

        if (!initialExpanded[initialChapterId] && mergedThreads.length > 0) {
          initialExpanded[mergedThreads[0].id] = true;
        }

        setExpandedThreads(initialExpanded);
      } catch (error) {
        if (isMounted) {
          setErrorMessage('Não foi possível carregar as discussões.');
          setThreads([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadDiscussions();

    return () => {
      isMounted = false;
    };
  }, [bookId, initialChapterId]);

  // Ordena comentários de cada thread conforme o filtro ativo.
  // Tecnologias utilizadas: useMemo e Array.sort.
  // Objetivo: alternar entre comentários recentes e populares sem refazer a carga.
  // Observações: o array é copiado para evitar mutação do estado original.
  const filteredChapters = useMemo(() => {
    return threads.map((thread) => {
      const sortedComments = [...(thread.comments || [])];
      if (selectedFilter === 'populares') {
        sortedComments.sort((a, b) => b.likes - a.likes);
      } else {
        sortedComments.sort((a, b) => b.id - a.id);
      }
      return { ...thread, comments: sortedComments };
    });
  }, [threads, selectedFilter]);

  // Expande ou recolhe uma discussão específica.
  // Tecnologias utilizadas: setState funcional.
  // Objetivo: permitir foco em um capítulo por vez sem sair da lista.
  // Observações: o estado é mantido por thread para preservar a navegação do usuário.
  const toggleThread = (threadId) => {
    setExpandedThreads((prev) => ({ ...prev, [threadId]: !prev[threadId] }));
  };

  // Atualiza manualmente os comentários já carregados na tela.
  // Tecnologias utilizadas: getDiscussions, Map e atualização imutável de estado.
  // Objetivo: refletir comentários mais recentes sem recarregar a página inteira.
  // Observações: threads sem discussionId são preservadas para evitar perda de contexto.
  const handleRefreshComments = async () => {
    try {
      setIsRefreshing(true);
      const discussionsResult = await getDiscussions(bookId);
      const safeDiscussions = Array.isArray(discussionsResult) ? discussionsResult : [];
      const discussionsById = new Map(
        safeDiscussions
          .filter((discussion) => Number.isFinite(Number(discussion?.id)))
          .map((discussion) => [Number(discussion.id), discussion])
      );

      setThreads((prev) =>
        prev.map((thread) => {
          const discussion = discussionsById.get(Number(thread.discussionId));
          if (!discussion) {
            return thread;
          }

          return {
            ...thread,
            discussionTitle: discussion.title || thread.discussionTitle,
            discussionDescription: discussion.description || thread.discussionDescription,
            comments: Array.isArray(discussion.comments) ? discussion.comments : [],
          };
        })
      );
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar os comentários agora.');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Adiciona um comentário e cria a discussão automaticamente quando necessário.
  // Tecnologias utilizadas: createDiscussionForChapter, createChapterComment, Alert.
  // Objetivo: permitir participação mesmo quando o capítulo ainda não possui thread.
  // Observações: o comentário pendente é inserido de forma otimista após o envio.
  const handleAddComment = async (thread) => {
    const text = (newComments[thread.id] || '').trim();
    if (!text) {
      Alert.alert('Comentário vazio', 'Escreva algo antes de publicar.');
      return;
    }

    try {
      let discussionId = thread?.discussionId;

      if (!discussionId) {
        const createdDiscussion = await createDiscussionForChapter(
          bookId,
          thread?.chapterTitle || thread?.discussionTitle,
          thread?.discussionDescription || ''
        );
        discussionId = createdDiscussion?.id;

        if (!discussionId) {
          throw new Error('Falha ao criar discussão para o capítulo.');
        }

        setThreads((prev) =>
          prev.map((item) =>
            item.id === thread.id
              ? {
                  ...item,
                  discussionId,
                  discussionTitle: createdDiscussion?.title || item.discussionTitle,
                  discussionDescription: createdDiscussion?.description || item.discussionDescription,
                }
              : item
          )
        );
      }

      await createChapterComment(discussionId, { conteudo: text });
      const pendingComment = {
        id: Date.now(),
        author: 'Você',
        date: 'Agora mesmo',
        text,
        likes: 0,
        replies: 0,
        avatar: 'https://i.pravatar.cc/100?img=5',
        status: 'PENDING',
      };
      setThreads((prev) =>
        prev.map((item) =>
          item.id === thread.id
            ? {
                ...item,
                comments: [pendingComment, ...(Array.isArray(item.comments) ? item.comments : [])],
              }
            : item
        )
      );
      setNewComments((prev) => ({ ...prev, [thread.id]: '' }));
      Alert.alert('Comentário enviado', 'Seu comentário foi enviado para aprovação do moderador/admin.');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível enviar seu comentário agora.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Cabeçalho fixo com retorno, atualização e atalho de moderação. */}
      {/* Tecnologias utilizadas: StatusBar, LinearGradient, Feather e TouchableOpacity. */}
      {/* Objetivo: dar contexto visual e ações rápidas no topo da discussão. */}
      {/* Observações: o visual forte ajuda a separar a tela do restante do app. */}
      <StatusBar barStyle="light-content" backgroundColor="#0b1f2a" />

      <LinearGradient
        colors={['#6B0F2E', '#0a0f1a', '#003D2B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation?.goBack?.()}
            hitSlop={HIT_SLOP}
            accessibilityRole="button"
            accessibilityLabel="Voltar para a tela anterior"
          >
            <Feather name="arrow-left" size={22} color="#fefce8" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Fórum de Discussão</Text>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.moderationButton}
              disabled
              accessibilityRole="button"
              accessibilityLabel="Atalho de moderação indisponível"
              accessibilityState={{ disabled: true }}
            >
              <Feather name="shield" size={18} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.moderationButton, styles.headerActionSpacing]}
              onPress={handleRefreshComments}
              disabled={isRefreshing}
              accessibilityRole="button"
              accessibilityLabel="Atualizar comentários"
              accessibilityState={{ disabled: isRefreshing }}
            >
              {isRefreshing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Feather name="refresh-cw" size={18} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.bookSubtitle}>{book?.title || 'Livro do mês'}</Text>
      </LinearGradient>

      {/* Área principal com estados de loading, erro e lista das threads. */}
      {/* Tecnologias utilizadas: ScrollView, renderização condicional e cards. */}
      {/* Objetivo: apresentar capítulos, comentários e formulário em uma rolagem única. */}
      {/* Observações: o estado vazio orienta quando não há discussões disponíveis. */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color="#0f766e" />
            <Text style={styles.emptyStateText}>Carregando discussões...</Text>
          </View>
        ) : null}

        {!isLoading && !!errorMessage ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>{errorMessage}</Text>
          </View>
        ) : null}

        {!isLoading && !errorMessage && filteredChapters.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubble-ellipses-outline" size={28} color="#9ca3af" />
            <Text style={styles.emptyStateText}>Sem discussões disponíveis para este livro.</Text>
          </View>
        ) : null}

        {!isLoading && !errorMessage ? filteredChapters.map((chapter) => {
          const isExpanded = expandedThreads[chapter.id];

          return (
            <View key={chapter.id} style={styles.chapterCard}>
              {/* Cabeçalho do capítulo com título, descrição e contagem de comentários. */}
              {/* Tecnologias utilizadas: TouchableOpacity, Feather e textos auxiliares. */}
              {/* Objetivo: abrir ou fechar a thread sem trocar de tela. */}
              {/* Observações: o badge numérico ajuda a localizar capítulos mais ativos. */}
              <TouchableOpacity
                style={styles.chapterHeader}
                onPress={() => toggleThread(chapter.id)}
                hitSlop={HIT_SLOP}
                accessibilityRole="button"
                accessibilityLabel={`Alternar comentários do capítulo ${chapter.chapterTitle || chapter.title}`}
                accessibilityState={{ expanded: Boolean(isExpanded) }}
              >
                <View style={styles.chapterInfo}>
                  <View style={styles.chapterBadge}>
                    <Text style={styles.chapterBadgeText}>{chapter.chapterId || chapter.id}</Text>
                  </View>

                  <View style={styles.chapterTitleContainer}>
                    <Text style={styles.chapterTitle}>{chapter.chapterTitle || chapter.title}</Text>
                    {chapter.discussionDescription ? (
                      <Text style={styles.chapterCommentCount} numberOfLines={2}>
                        {chapter.discussionDescription}
                      </Text>
                    ) : null}
                    <Text style={styles.chapterCommentCount}>
                      {chapter.comments.length} comentário{chapter.comments.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                </View>

                <Feather name={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} color="#6b7280" />
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.commentsSection}>
                  {/* Controle de ordenação da lista de comentários. */}
                  {/* Tecnologias utilizadas: TouchableOpacity e estados de filtro. */}
                  {/* Objetivo: alternar entre comentários mais recentes e mais populares. */}
                  {/* Observações: o destaque visual mostra o filtro ativo sem abrir modal. */}
                  <View style={styles.sortRow}>
                    <Text style={styles.sortLabel}>Ordenar por:</Text>

                    <TouchableOpacity
                      style={[
                        styles.filterButton,
                        styles.filterButtonMuted,
                        selectedFilter === 'recentes' && styles.filterButtonSelected,
                      ]}
                      onPress={() => setSelectedFilter('recentes')}
                      hitSlop={HIT_SLOP}
                      accessibilityRole="button"
                      accessibilityLabel="Ordenar comentários por mais recentes"
                      accessibilityState={{ selected: selectedFilter === 'recentes' }}
                    >
                      <Text
                        style={[
                          styles.filterTextMuted,
                          selectedFilter === 'recentes' && styles.filterTextSelected,
                        ]}
                      >
                        Recentes
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.filterButton,
                        styles.filterButtonMuted,
                        selectedFilter === 'populares' && styles.filterButtonSelected,
                      ]}
                      onPress={() => setSelectedFilter('populares')}
                      hitSlop={HIT_SLOP}
                      accessibilityRole="button"
                      accessibilityLabel="Ordenar comentários por mais populares"
                      accessibilityState={{ selected: selectedFilter === 'populares' }}
                    >
                      <Text
                        style={[
                          styles.filterTextMuted,
                          selectedFilter === 'populares' && styles.filterTextSelected,
                        ]}
                      >
                        Populares
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Estado vazio da thread quando ainda não há comentários. */}
                  {/* Tecnologias utilizadas: Icone, textos de apoio e renderização condicional. */}
                  {/* Objetivo: orientar o usuário a iniciar a discussão. */}
                  {/* Observações: a mensagem muda conforme a thread já exista ou não. */}
                  {chapter.comments.length === 0 ? (
                    <View style={styles.emptyState}>
                      <Ionicons name="chatbubble-ellipses-outline" size={28} color="#9ca3af" />
                      <Text style={styles.emptyStateText}>Nenhum comentário ainda</Text>
                      <Text style={styles.emptyStateSubtext}>
                        {chapter.discussionId
                          ? 'Seja o primeiro a comentar esta discussão.'
                          : 'Este capítulo ainda não possui discussão vinculada.'}
                      </Text>
                    </View>
                  ) : (
                    // Lista de comentários já publicados na thread.
                    // Tecnologias utilizadas: map, Image, Text e chips de status.
                    // Objetivo: exibir cada mensagem com autor, data e aprovação.
                    // Observações: o chip de status ajuda a distinguir comentários pendentes.
                    chapter.comments.map((comment) => (
                      <View key={comment.id} style={styles.commentCard}>
                        {/* Cabeçalho visual de cada comentário com status e autoria. */}
                        {/* Tecnologias utilizadas: Image, layout em linha e utilitário de status. */}
                        {/* Objetivo: facilitar a leitura rápida de quem publicou e como está o comentário. */}
                        {/* Observações: o avatar e a data ajudam a contextualizar a conversa. */}
                        {(() => {
                          const statusMeta = getCommentStatusMeta(comment.status);
                          return (
                        <View style={styles.commentHeader}>
                          <View style={styles.commentTopRow}>
                            <View style={styles.commentProfileRow}>
                              <Image source={{ uri: comment.avatar }} style={styles.avatar} />

                              <View style={styles.commentProfileText}>
                                <Text style={styles.commentAuthor}>{comment.author}</Text>
                                <Text style={styles.commentTime}>{comment.date}</Text>
                              </View>
                            </View>

                            {statusMeta ? (
                              <View
                                style={[
                                  styles.commentStatusBadge,
                                  { backgroundColor: statusMeta.bg, borderColor: statusMeta.border },
                                ]}
                              >
                                <Text style={[styles.commentStatusText, { color: statusMeta.color }]}>
                                  {statusMeta.label}
                                </Text>
                              </View>
                            ) : null}
                          </View>
                        </View>
                          );
                        })()}

                        <Text style={styles.commentText}>{comment.text}</Text>
                      </View>
                    ))
                  )}

                  {/* Formulário para publicar um novo comentário na thread. */}
                  {/* Tecnologias utilizadas: TextInput, TouchableOpacity e LinearGradient. */}
                  {/* Objetivo: permitir participação direta do leitor na discussão. */}
                  {/* Observações: o feedback otimista mostra que o envio foi aceito. */}
                  <View style={styles.newCommentForm}>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Compartilhe sua opinião sobre este capítulo..."
                      placeholderTextColor="#9ca3af"
                      multiline
                      value={newComments[chapter.id]}
                      onChangeText={(text) => setNewComments((prev) => ({ ...prev, [chapter.id]: text }))}
                      accessibilityLabel={`Campo para comentar no capítulo ${chapter.chapterTitle || chapter.title}`}
                    />

                    <TouchableOpacity
                      onPress={() => handleAddComment(chapter)}
                      hitSlop={HIT_SLOP}
                      accessibilityRole="button"
                      accessibilityLabel={`Publicar comentário no capítulo ${chapter.chapterTitle || chapter.title}`}
                    >
                      <LinearGradient
                        colors={['#6B0F2E', '#0a0f1a', '#003D2B']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[
                          styles.submitButton,
                          !chapter.discussionId ? { opacity: 0.65 } : null,
                        ]}
                      >
                        <View style={styles.submitButtonContent}>
                          <Feather name="send" size={15} color="#fff" />
                          <Text style={styles.submitButtonText}>Publicar comentário</Text>
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          );
        }) : null}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <FooterNav navigation={navigation} activeKey="discussao" />
    </SafeAreaView>
  );
}
