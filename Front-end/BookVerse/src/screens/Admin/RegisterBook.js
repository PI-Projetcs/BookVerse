import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import FooterNav from '../../components/FooterNav';
import Header from '../../components/Header';
import { ADMIN_FOOTER_ITEMS } from '../../constants/adminFooterItems';
import {
  createAdminBook,
  updateAdminBook,
} from '../../services/bookService';
import { adminRegisterStyles as styles } from '../../styles/adminRegisterStyles';

const GENRE_OPTIONS = [
  'Romance',
  'Fantasia',
  'Ficcao Cientifica',
  'Terror',
  'Suspense',
  'Aventura',
  'Drama',
  'Poesia',
  'Biografia',
  'Historia',
  'Autoajuda',
  'Infantojuvenil',
];

const EMPTY_FORM = {
  title: '',
  author: '',
  genre: '',
  year: '',
  rating: '',
  coverUrl: '',
  synopsis: '',
  pages: '',
  isHighlight: false,
  chapters: [],
};

const COVER_PLACEHOLDER = 'https://placehold.co/180x240/e5e7eb/475569?text=BookV';
const HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };

function createChapter(chapter = {}, index = 0) {
  return {
    id: chapter?.id || `chapter-${Date.now()}-${index}`,
    title: chapter?.title || chapter?.titulo || '',
  };
}

function normalizeChapters(chapters = []) {
  if (Array.isArray(chapters) && chapters.length > 0) {
    return chapters.map((chapter, index) => createChapter(chapter, index));
  }

  return [createChapter()];
}

function mapBookToForm(book) {
  return {
    title: book?.title || '',
    author: book?.author || '',
    genre: book?.genre || '',
    year: book?.year ? String(book.year) : '',
    rating: Number.isFinite(book?.rating) ? String(book.rating) : '',
    coverUrl: book?.coverUrl || '',
    synopsis: book?.synopsis || '',
    pages: book?.pages ? String(book.pages) : '',
    isHighlight: Boolean(book?.highlight),
    chapters: normalizeChapters(book?.chapters),
  };
}

export default function RegisterBook({ navigation, route }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingBookId, setEditingBookId] = useState(null);
  const [isGenreListOpen, setIsGenreListOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const primaryButtonLabel = editingBookId ? 'Salvar alterações' : 'Cadastrar livro';
  const screenModeLabel = editingBookId ? 'Modo edição' : 'Novo cadastro';
  const previewCoverUrl = form.coverUrl.trim() || COVER_PLACEHOLDER;

  useEffect(() => {
    const routeBook = route?.params?.bookData;
    if (!routeBook) {
      return;
    }

    setEditingBookId(routeBook?.id || null);
    setForm(mapBookToForm(routeBook));
    setIsGenreListOpen(false);
    navigation.setParams?.({ bookData: undefined, editToken: undefined });
  }, [navigation, route?.params?.bookData, route?.params?.editToken]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleChapterChange = (chapterId, value) => {
    setForm((prev) => ({
      ...prev,
      chapters: prev.chapters.map((chapter) =>
        chapter.id === chapterId ? { ...chapter, title: value } : chapter
      ),
    }));
  };

  const addChapter = () => {
    setForm((prev) => ({
      ...prev,
      chapters: [...prev.chapters, createChapter({}, prev.chapters.length)],
    }));
  };

  const removeChapter = (chapterId) => {
    setForm((prev) => {
      const nextChapters = prev.chapters.filter((chapter) => chapter.id !== chapterId);
      return {
        ...prev,
        chapters: nextChapters.length > 0 ? nextChapters : [createChapter()],
      };
    });
  };

  const moveChapter = (chapterId, direction) => {
    setForm((prev) => {
      const currentIndex = prev.chapters.findIndex((chapter) => chapter.id === chapterId);
      const nextIndex = currentIndex + direction;

      if (currentIndex < 0 || nextIndex < 0 || nextIndex >= prev.chapters.length) {
        return prev;
      }

      const nextChapters = [...prev.chapters];
      const [movedChapter] = nextChapters.splice(currentIndex, 1);
      nextChapters.splice(nextIndex, 0, movedChapter);

      return {
        ...prev,
        chapters: nextChapters,
      };
    });
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingBookId(null);
    setIsGenreListOpen(false);
  };

  const handleEdit = (book) => {
    setEditingBookId(book?.id || null);
    setForm(mapBookToForm(book));
    setIsGenreListOpen(false);
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.author.trim() || !form.genre.trim()) {
      Alert.alert('Campos obrigatórios', 'Preencha título, autor e categoria para continuar.');
      return;
    }

    const payload = {
      title: form.title.trim(),
      author: form.author.trim(),
      genre: form.genre.trim(),
      year: form.year ? Number(form.year) : null,
      rating: form.rating ? Number(form.rating) : 0,
      coverUrl: form.coverUrl.trim(),
      synopsis: form.synopsis.trim(),
      pages: form.pages ? Number(form.pages) : null,
      highlight: form.isHighlight,
      chapters: form.chapters
        .map((chapter, index) => ({
          id: Number.isFinite(Number(chapter.id)) ? Number(chapter.id) : index + 1,
          title: String(chapter.title || '').trim(),
        }))
        .filter((chapter) => chapter.title.length > 0),
    };

    if (payload.year && !Number.isFinite(payload.year)) {
      Alert.alert('Ano inválido', 'Informe um ano numérico válido.');
      return;
    }

    if (!Number.isFinite(payload.rating)) {
      Alert.alert('Nota inválida', 'Informe uma nota numérica válida.');
      return;
    }

    try {
      setIsSaving(true);
      if (editingBookId) {
        await updateAdminBook(editingBookId, payload);
        Alert.alert('Livro atualizado', 'As alterações foram salvas com sucesso.');
        resetForm();
        navigation.navigate('AdminBooks');
      } else {
        await createAdminBook(payload);
        Alert.alert('Livro cadastrado', 'O novo livro foi incluído no catálogo.');
        resetForm();
      }
    } catch (error) {
      console.error('[RegisterBook] erro ao salvar:', error?.response?.status, error?.response?.data, error?.message);
      Alert.alert('Erro', `Não foi possível salvar este livro agora.\n${error?.response?.status || error?.message || 'Sem resposta do servidor'}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />
      <Header
        title="BookV"
        subtitle="Cadastro e gestão de livros"
        onRightAction={() => navigation.navigate('Admin')}
        rightActionLabel="Painel"
        rightActionIcon="grid-outline"
      />

      <View style={styles.content}>
        <ScrollView contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={false}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryTopRow}>
              <View>
                <Text style={styles.summaryTitle}>Cadastro de livros</Text>
                <Text style={styles.summarySubtitle}>Crie novos livros e edite quando necessário.</Text>
              </View>
              <View style={styles.summaryBadge}>
                <Text style={styles.summaryBadgeText}>{screenModeLabel}</Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>Cadastrar Livro</Text>
              {editingBookId ? (
                <TouchableOpacity
                  onPress={resetForm}
                  activeOpacity={0.8}
                  hitSlop={HIT_SLOP}
                  accessibilityRole="button"
                  accessibilityLabel="Cancelar edição do livro"
                >
                  <Text style={styles.cardActionText}>Cancelar edição</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            <View style={styles.coverPreviewWrap}>
              <Image source={{ uri: previewCoverUrl }} style={styles.coverPreview} />
              <Text style={styles.coverPreviewText}>
                Preencha os dados abaixo para cadastrar um novo livro ou selecionar um item da lista para editar.
              </Text>
            </View>

            <Text style={styles.fieldLabel}>Titulo</Text>
            <TextInput
              value={form.title}
              onChangeText={(value) => handleChange('title', value)}
              placeholder="Ex.: O Hobbit"
              placeholderTextColor="#94a3b8"
              style={styles.input}
              accessibilityLabel="Título do livro"
            />

            <Text style={styles.fieldLabel}>Autor</Text>
            <TextInput
              value={form.author}
              onChangeText={(value) => handleChange('author', value)}
              placeholder="Nome do autor"
              placeholderTextColor="#94a3b8"
              style={styles.input}
              accessibilityLabel="Autor do livro"
            />

            <View style={styles.row}>
              <View style={styles.column}>
                <Text style={styles.fieldLabel}>Categoria</Text>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.selectTrigger}
                  onPress={() => setIsGenreListOpen((prev) => !prev)}
                  hitSlop={HIT_SLOP}
                  accessibilityRole="button"
                  accessibilityLabel="Selecionar categoria do livro"
                  accessibilityState={{ expanded: isGenreListOpen }}
                >
                  <Text
                    style={[
                      styles.selectTriggerText,
                      !form.genre && styles.selectTriggerPlaceholder,
                    ]}
                  >
                    {form.genre || 'Selecionar categoria'}
                  </Text>
                  <Ionicons
                    name={isGenreListOpen ? 'chevron-up-outline' : 'chevron-down-outline'}
                    size={18}
                    color="#64748b"
                  />
                </TouchableOpacity>

                {isGenreListOpen ? (
                  <View style={styles.selectList}>
                    <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
                      {GENRE_OPTIONS.map((genre) => {
                        const isActive = form.genre === genre;

                        return (
                          <TouchableOpacity
                            key={genre}
                            activeOpacity={0.85}
                            style={styles.selectOption}
                            onPress={() => {
                              handleChange('genre', genre);
                              setIsGenreListOpen(false);
                            }}
                            hitSlop={HIT_SLOP}
                            accessibilityRole="button"
                            accessibilityLabel={`Selecionar categoria ${genre}`}
                            accessibilityState={{ selected: isActive }}
                          >
                            <Text style={[styles.selectOptionText, isActive && styles.selectOptionTextActive]}>{genre}</Text>
                            {isActive ? <Ionicons name="checkmark" size={16} color="#0f766e" /> : null}
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                ) : null}
              </View>
              <View style={styles.column}>
                <Text style={styles.fieldLabel}>Ano</Text>
                <TextInput
                  value={form.year}
                  onChangeText={(value) => handleChange('year', value.replace(/[^\d]/g, ''))}
                  placeholder="2026"
                  placeholderTextColor="#94a3b8"
                  keyboardType="number-pad"
                  style={styles.input}
                  accessibilityLabel="Ano de publicação"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.column}>
                <Text style={styles.fieldLabel}>Nota</Text>
                <TextInput
                  value={form.rating}
                  onChangeText={(value) => handleChange('rating', value.replace(/[^\d.]/g, ''))}
                  placeholder="4.5"
                  placeholderTextColor="#94a3b8"
                  keyboardType="decimal-pad"
                  style={styles.input}
                  accessibilityLabel="Nota do livro"
                />
              </View>
              <View style={styles.column}>
                <Text style={styles.fieldLabel}>URL da capa</Text>
                <TextInput
                  value={form.coverUrl}
                  onChangeText={(value) => handleChange('coverUrl', value)}
                  placeholder="https://..."
                  placeholderTextColor="#94a3b8"
                  style={styles.input}
                  accessibilityLabel="URL da capa do livro"
                />
              </View>
            </View>

            <Text style={styles.fieldLabel}>Sinopse</Text>
            <TextInput
              value={form.synopsis}
              onChangeText={(value) => handleChange('synopsis', value)}
              placeholder="Resumo do livro para exibicao no app"
              placeholderTextColor="#94a3b8"
              multiline
              style={[styles.input, styles.inputMultiline]}
              accessibilityLabel="Sinopse do livro"
            />

            <View style={styles.chapterHeaderRow}>
              <Text style={styles.fieldLabel}>Capítulos</Text>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={addChapter}
                hitSlop={HIT_SLOP}
                accessibilityRole="button"
                accessibilityLabel="Adicionar capítulo"
                style={styles.addChapterButton}
              >
                <Ionicons name="add-circle-outline" size={16} color="#0f766e" />
                <Text style={styles.addChapterButtonText}>Adicionar capítulo</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.chaptersList}>
              {form.chapters.map((chapter, index) => (
                <View key={chapter.id} style={styles.chapterItem}>
                  <View style={styles.chapterItemHeader}>
                    <Text style={styles.chapterIndex}>Capítulo {index + 1}</Text>
                    <View style={styles.chapterActionsGroup}>
                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => moveChapter(chapter.id, -1)}
                        disabled={index === 0}
                        hitSlop={HIT_SLOP}
                        accessibilityRole="button"
                        accessibilityLabel={`Mover capítulo ${index + 1} para cima`}
                        accessibilityState={{ disabled: index === 0 }}
                        style={[styles.chapterActionButton, index === 0 && styles.chapterActionButtonDisabled]}
                      >
                        <Ionicons name="chevron-up-outline" size={16} color={index === 0 ? '#cbd5e1' : '#0f766e'} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => moveChapter(chapter.id, 1)}
                        disabled={index === form.chapters.length - 1}
                        hitSlop={HIT_SLOP}
                        accessibilityRole="button"
                        accessibilityLabel={`Mover capítulo ${index + 1} para baixo`}
                        accessibilityState={{ disabled: index === form.chapters.length - 1 }}
                        style={[
                          styles.chapterActionButton,
                          index === form.chapters.length - 1 && styles.chapterActionButtonDisabled,
                        ]}
                      >
                        <Ionicons name="chevron-down-outline" size={16} color={index === form.chapters.length - 1 ? '#cbd5e1' : '#0f766e'} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => removeChapter(chapter.id)}
                        hitSlop={HIT_SLOP}
                        accessibilityRole="button"
                        accessibilityLabel={`Remover capítulo ${index + 1}`}
                        style={styles.removeChapterButton}
                      >
                        <Ionicons name="trash-outline" size={16} color="#9f1239" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TextInput
                    value={chapter.title}
                    onChangeText={(value) => handleChapterChange(chapter.id, value)}
                    placeholder={`Nome do capítulo ${index + 1}`}
                    placeholderTextColor="#94a3b8"
                    style={styles.input}
                    accessibilityLabel={`Nome do capítulo ${index + 1}`}
                  />
                </View>
              ))}
            </View>

            <View style={styles.row}>
              <View style={styles.column}>
                <Text style={styles.fieldLabel}>Páginas</Text>
                <TextInput
                  value={form.pages}
                  onChangeText={(value) => handleChange('pages', value.replace(/[^\d]/g, ''))}
                  placeholder="320"
                  placeholderTextColor="#94a3b8"
                  keyboardType="number-pad"
                  style={styles.input}
                  accessibilityLabel="Total de páginas"
                />
              </View>
              <View style={styles.column}>
                <Text style={styles.fieldLabel}>Destaque</Text>
                <TouchableOpacity
                  style={[styles.input, { justifyContent: 'center' }]}
                  onPress={() => handleChange('isHighlight', !form.isHighlight)}
                  activeOpacity={0.7}
                  hitSlop={HIT_SLOP}
                  accessibilityRole="checkbox"
                  accessibilityLabel="Marcar como livro destaque"
                  accessibilityState={{ checked: form.isHighlight }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={form.isHighlight ? { color: '#0f766e', fontWeight: '600' } : { color: '#94a3b8' }}>
                      {form.isHighlight ? 'Sim' : 'Não'}
                    </Text>
                    <Ionicons
                      name={form.isHighlight ? 'checkbox' : 'checkbox-outline'}
                      size={20}
                      color={form.isHighlight ? '#0f766e' : '#cbd5e1'}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.buttonTouch}
                onPress={handleSubmit}
                activeOpacity={0.88}
                disabled={isSaving}
                hitSlop={HIT_SLOP}
                accessibilityRole="button"
                accessibilityLabel={primaryButtonLabel}
                accessibilityState={{ disabled: isSaving }}
              >
                <LinearGradient
                  colors={['#7D1F3E', '#1e293b', '#065f46']}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.primaryButton}
                >
                  {isSaving ? (
                    <ActivityIndicator color="#fefce8" />
                  ) : (
                    <Text style={styles.primaryButtonText}>{primaryButtonLabel}</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.buttonTouch}
                onPress={resetForm}
                activeOpacity={0.88}
                hitSlop={HIT_SLOP}
                accessibilityRole="button"
                accessibilityLabel="Limpar formulário do livro"
              >
                <View style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>Limpar</Text>
                </View>
              </TouchableOpacity>
            </View>

            <Text style={styles.helperText}>
              A aba Livros concentra os livros cadastrados em grid com filtros, edição e exclusão.
            </Text>
          </View>
        </ScrollView>
      </View>

      <FooterNav navigation={navigation} activeKey="cadastro" items={ADMIN_FOOTER_ITEMS} />
    </View>
  );
}