import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styles from '../../styles/discussionStyles';
import FooterNav from '../../components/FooterNav';
import {
  addCommentToDiscussion,
  getDiscussions,
  likeComment,
  toggleReportComment,
} from '../../services/bookService';

export default function DiscussionScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const bookId = Number(route?.params?.bookId) || 1;
  const initialChapterId = Number(route?.params?.chapterId);
  const [selectedFilter, setSelectedFilter] = useState('recentes');
  const [expandedChapters, setExpandedChapters] = useState({});
  const [newComments, setNewComments] = useState({});
  const [chapters, setChapters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadDiscussions = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');
        const result = await getDiscussions(bookId);
        if (!isMounted) {
          return;
        }

        const safeChapters = Array.isArray(result) ? result : [];
        setChapters(safeChapters);

        const initialExpanded = safeChapters.reduce((accumulator, chapter) => {
          accumulator[chapter.id] = chapter.id === initialChapterId;
          return accumulator;
        }, {});

        if (!initialExpanded[initialChapterId] && safeChapters.length > 0) {
          initialExpanded[safeChapters[0].id] = true;
        }

        setExpandedChapters(initialExpanded);
      } catch (error) {
        if (isMounted) {
          setErrorMessage('Nao foi possivel carregar as discussoes.');
          setChapters([]);
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

  const filteredChapters = useMemo(() => {
    return chapters.map((chapter) => {
      const sortedComments = [...chapter.comments];
      if (selectedFilter === 'populares') {
        sortedComments.sort((a, b) => b.likes - a.likes);
      } else {
        sortedComments.sort((a, b) => b.id - a.id);
      }
      return { ...chapter, comments: sortedComments };
    });
  }, [chapters, selectedFilter]);

  const toggleChapter = (chapterId) => {
    setExpandedChapters((prev) => ({ ...prev, [chapterId]: !prev[chapterId] }));
  };

  const updateCommentInChapter = (chapterId, commentId, updater) => {
    setChapters((prev) =>
      prev.map((chapter) =>
        chapter.id === chapterId
          ? {
              ...chapter,
              comments: chapter.comments.map((comment) =>
                comment.id === commentId ? updater(comment) : comment
              ),
            }
          : chapter
      )
    );
  };

  const prependCommentInChapter = (chapterId, comment) => {
    setChapters((prev) =>
      prev.map((chapter) =>
        chapter.id === chapterId
          ? {
              ...chapter,
              comments: [comment, ...chapter.comments],
            }
          : chapter
      )
    );
  };

  const handleLike = async (chapterId, commentId) => {
    updateCommentInChapter(chapterId, commentId, (comment) => ({
      ...comment,
      likes: comment.likes + 1,
    }));

    try {
      const response = await likeComment(bookId, chapterId, commentId);
      const updatedComment = response?.item;
      if (!updatedComment) {
        return;
      }

      updateCommentInChapter(chapterId, commentId, (comment) => ({
        ...comment,
        likes: Number(updatedComment.likes) || comment.likes,
      }));
    } catch (error) {
      // Keep optimistic update even when request fails.
    }
  };

  const handleReport = async (chapterId, commentId) => {
    const currentChapter = chapters.find((chapter) => chapter.id === chapterId);
    const currentComment = currentChapter?.comments?.find((comment) => comment.id === commentId);
    const nextReported = !currentComment?.reported;

    updateCommentInChapter(chapterId, commentId, (comment) => ({
      ...comment,
      reported: nextReported,
    }));

    try {
      const response = await toggleReportComment(bookId, chapterId, commentId, nextReported);
      const updatedComment = response?.item;
      if (!updatedComment) {
        return;
      }

      updateCommentInChapter(chapterId, commentId, (comment) => ({
        ...comment,
        reported: Boolean(updatedComment.reported),
      }));
    } catch (error) {
      // Keep optimistic toggle when request fails.
    }
  };

  const handleAddComment = async (chapterId) => {
    const text = (newComments[chapterId] || '').trim();
    if (!text) return;

    setNewComments((prev) => ({ ...prev, [chapterId]: '' }));

    const fallbackComment = {
      id: Date.now(),
      author: 'Você',
      date: 'Agora mesmo',
      text,
      likes: 0,
      replies: 0,
      avatar: 'https://i.pravatar.cc/100?img=5',
      reported: false,
    };

    let commentToInsert = fallbackComment;

    try {
      const response = await addCommentToDiscussion(bookId, chapterId, {
        text,
        author: 'Você',
      });

      if (response?.item) {
        commentToInsert = {
          ...fallbackComment,
          ...response.item,
        };
      }
    } catch (error) {
      // Keep local fallback comment when request fails.
    }

    prependCommentInChapter(chapterId, commentToInsert);
  };

  return (
    <SafeAreaView style={styles.container}>
    <StatusBar barStyle="light-content" backgroundColor="#0b1f2a" />

      <LinearGradient
       colors={['#6B0F2E', '#0a0f1a', '#003D2B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation?.goBack?.()}>
            <Feather name="arrow-left" size={22} color="#fefce8" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Fórum de Discussão</Text>

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.moderationButton}>
              <Feather name="shield" size={18} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.moderationButton, styles.headerActionSpacing]}>
              <Feather name="message-square" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.bookSubtitle}>O Código Da Vinci</Text>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color="#0f766e" />
            <Text style={styles.emptyStateText}>Carregando discussoes...</Text>
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
            <Text style={styles.emptyStateText}>Sem capitulos de discussao.</Text>
          </View>
        ) : null}

        {!isLoading && !errorMessage ? filteredChapters.map((chapter) => {
          const isExpanded = expandedChapters[chapter.id];

          return (
            <View key={chapter.id} style={styles.chapterCard}>
              <TouchableOpacity style={styles.chapterHeader} onPress={() => toggleChapter(chapter.id)}>
                <View style={styles.chapterInfo}>
                  <View style={styles.chapterBadge}>
                    <Text style={styles.chapterBadgeText}>{chapter.id}</Text>
                  </View>

                  <View style={styles.chapterTitleContainer}>
                    <Text style={styles.chapterTitle}>{chapter.title}</Text>
                    <Text style={styles.chapterCommentCount}>
                      {chapter.comments.length} comentário{chapter.comments.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                </View>

                <Feather name={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} color="#6b7280" />
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.commentsSection}>
                  <View style={styles.sortRow}>
                    <Text style={styles.sortLabel}>Ordenar por:</Text>

                    <TouchableOpacity
                      style={[
                        styles.filterButton,
                        styles.filterButtonMuted,
                        selectedFilter === 'recentes' && styles.filterButtonSelected,
                      ]}
                      onPress={() => setSelectedFilter('recentes')}
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

                  {chapter.comments.length === 0 ? (
                    <View style={styles.emptyState}>
                      <Ionicons name="chatbubble-ellipses-outline" size={28} color="#9ca3af" />
                      <Text style={styles.emptyStateText}>Nenhum comentário ainda</Text>
                      <Text style={styles.emptyStateSubtext}>Seja o primeiro a comentar este capítulo.</Text>
                    </View>
                  ) : (
                    chapter.comments.map((comment) => (
                      <View key={comment.id} style={styles.commentCard}>
                        <View style={styles.commentHeader}>
                          <View style={styles.commentProfileRow}>
                            <Image source={{ uri: comment.avatar }} style={styles.avatar} />

                            <View style={styles.commentProfileText}>
                              <Text style={styles.commentAuthor}>{comment.author}</Text>
                              <Text style={styles.commentTime}>{comment.date}</Text>
                            </View>
                          </View>
                        </View>

                        <Text style={styles.commentText}>{comment.text}</Text>

                        <View style={styles.commentActions}>
                          <TouchableOpacity style={styles.actionButton} onPress={() => handleLike(chapter.id, comment.id)}>
                            <Feather name="thumbs-up" size={14} color="#6b7280" />
                            <Text style={styles.actionText}>{comment.likes}</Text>
                          </TouchableOpacity>

                          <TouchableOpacity style={styles.actionButton}>
                            <MaterialCommunityIcons name="reply-outline" size={15} color="#6b7280" />
                            <Text style={styles.actionText}>
                              {comment.replies > 0
                                ? `${comment.replies} resposta${comment.replies > 1 ? 's' : ''}`
                                : 'Responder'}
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[styles.actionButton, styles.reportButton]}
                            onPress={() => handleReport(chapter.id, comment.id)}
                          >
                            <Feather name="flag" size={14} color={comment.reported ? '#7D1F3E' : '#6b7280'} />
                            <Text style={[styles.actionText, comment.reported && styles.actionTextActive]}>
                              Reportar
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))
                  )}

                  <View style={styles.newCommentForm}>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Compartilhe sua opinião sobre este capítulo..."
                      placeholderTextColor="#9ca3af"
                      multiline
                      value={newComments[chapter.id]}
                      onChangeText={(text) => setNewComments((prev) => ({ ...prev, [chapter.id]: text }))}
                    />

                    <TouchableOpacity onPress={() => handleAddComment(chapter.id)}>
                      <LinearGradient
                        colors={['#6B0F2E', '#0a0f1a', '#003D2B']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.submitButton}
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
