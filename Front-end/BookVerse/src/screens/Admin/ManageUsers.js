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
import FooterNav from '../../components/FooterNav';
import Header from '../../components/Header';
import { ADMIN_FOOTER_ITEMS } from '../../constants/adminFooterItems';
import {
  getAdminMembers,
  promoteAdminMember,
  updateAdminMemberStatus,
} from '../../services/adminService';
import { adminMembersStyles as styles } from '../../styles/adminMembersStyles';

const STATUS_FILTERS = [
  { key: 'all', label: 'Todos' },
  { key: 'active', label: 'Ativos' },
  { key: 'blocked', label: 'Bloqueados' },
];
const HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };

// Tela administrativa de membros e permissões.
// Tecnologias utilizadas: React Native, Ionicons, serviços admin e navegação.
// Objetivo: buscar usuários, filtrar status e executar promoção ou bloqueio.
// Observações: a tela usa debounce simples para evitar chamadas excessivas ao backend.

// Constrói o visual do badge conforme o status do membro.
// Tecnologias utilizadas: função pura e objetos de estilo inline.
// Objetivo: destacar rapidamente quem está ativo ou bloqueado.
// Observações: o retorno inclui cores e rótulo para reaproveitamento no card.
function getStatusBadgeStyle(status) {
  if (status === 'blocked') {
    return {
      container: { backgroundColor: '#fef2f2', borderColor: '#fda4af' },
      text: { color: '#9f1239' },
      label: 'Bloqueado',
    };
  }

  return {
    container: { backgroundColor: '#ecfeff', borderColor: '#67e8f9' },
    text: { color: '#0f766e' },
    label: 'Ativo',
  };
}

export default function ManageUsers({ navigation }) {
  const [members, setMembers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [roleUpdatingMemberId, setRoleUpdatingMemberId] = useState(null);

  // Carrega membros já filtrados no servidor para reduzir volume de dados.
  // Tecnologias utilizadas: getAdminMembers e async/await.
  // Objetivo: refletir a busca e o status selecionado com dados atuais.
  // Observações: o loading é exibido enquanto a consulta está em andamento.
  const loadMembers = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const items = await getAdminMembers({ query: searchText, status: statusFilter });
      setMembers(items);
    } catch (error) {
      setErrorMessage('Não foi possível carregar os membros.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Adia a consulta para absorver digitação rápida sem disparos repetidos.
    // Tecnologias utilizadas: setTimeout e cleanup do efeito.
    // Objetivo: reduzir ruído de rede ao filtrar por nome ou email.
    // Observações: 220ms costuma ser suficiente para busca responsiva.
    const timer = setTimeout(loadMembers, 220);
    return () => clearTimeout(timer);
  }, [searchText, statusFilter]);

  // Texto-resumo para dar contexto ao volume atualmente listado.
  // Tecnologias utilizadas: useMemo.
  // Objetivo: apresentar rapidamente quantos membros estão visíveis.
  // Observações: evita recalcular a frase a cada render sem necessidade.
  const summaryText = useMemo(() => `${members.length} membros listados`, [members.length]);

  // Alterna o status do membro entre ativo e bloqueado.
  // Tecnologias utilizadas: updateAdminMemberStatus e atualização local de estado.
  // Objetivo: permitir moderação operacional sem sair da listagem.
  // Observações: administradores não entram nessa ação para preservar acesso crítico.
  const handleToggleStatus = async (member) => {
    try {
      const nextStatus = member.status === 'active' ? 'blocked' : 'active';
      const updated = await updateAdminMemberStatus(member.id, nextStatus);
      if (!updated) return;
      setMembers((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    } catch (error) {
      Alert.alert('Falha ao atualizar usuário', 'Não foi possível alterar o status deste usuário agora.');
    }
  };

  // Promove um membro para administrador e mantém a linha sincronizada.
  // Tecnologias utilizadas: promoteAdminMember, Alert e estado de carregamento por item.
  // Objetivo: elevar permissões sem recarregar a tela inteira.
  // Observações: a resposta do backend pode trazer mensagem própria de erro.
  const handleToggleRole = async (member) => {
    if (roleUpdatingMemberId === member.id) {
      return;
    }

    try {
      setRoleUpdatingMemberId(member.id);
      const updated = await promoteAdminMember(member.id);
      if (!updated) return;
      setMembers((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        } catch (error) {
          let backendMsg = 'Não foi possível promover este usuário agora.';
          if (error?.response?.data?.message) {
            backendMsg = error.response.data.message;
          } else if (error?.response?.data?.error) {
            backendMsg = error.response.data.error;
          } else if (typeof error?.message === 'string') {
            backendMsg = error.message;
          }
          Alert.alert('Falha ao atualizar perfil', backendMsg);
    } finally {
      setRoleUpdatingMemberId((current) => (current === member.id ? null : current));
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />
      <Header
        title="BookV"
        subtitle="Gerenciar membros"
        onRightAction={() => navigation.navigate('Admin')}
        rightActionLabel="Painel"
        rightActionIcon="grid-outline"
      />

      <View style={styles.content}>
        {/* Área de busca, filtros e contagem resumida de membros. */}
        {/* Tecnologias utilizadas: TextInput, chips de filtro e texto derivado. */}
        {/* Objetivo: localizar perfis e separar ativos, bloqueados ou todos. */}
        {/* Observações: o recorte é enviado ao servidor para manter a tela leve. */}
        <View style={styles.filtersWrap}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color="#64748b" />
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Buscar por nome ou email"
              placeholderTextColor="#94a3b8"
              style={styles.searchInput}
              accessibilityLabel="Buscar membros"
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
                  accessibilityLabel={`Filtrar membros ${filter.label.toLowerCase()}`}
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
            <Text style={styles.feedbackText}>Carregando membros...</Text>
          </View>
        ) : null}

        {!isLoading && !!errorMessage ? (
          <View style={styles.feedbackWrap}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {!isLoading && !errorMessage ? (
          {/* Lista dos perfis encontrados e suas ações administrativas. */}
          {/* Tecnologias utilizadas: ScrollView, Image, Touchables e badges. */}
          {/* Objetivo: exibir status, dados principais e comandos de moderação. */}
          {/* Observações: a hierarquia visual separa ações de permissão e de bloqueio. */}
          <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
            {members.map((member) => {
              const badgeStyle = getStatusBadgeStyle(member.status);
              const isAdmin = member.role === 'admin';
              const isRoleUpdating = roleUpdatingMemberId === member.id;
              const canToggleStatus = !isAdmin;
              const canPromote = member.role === 'member';
              return (
                <View key={member.id} style={styles.card}>
                  <View style={styles.headerRow}>
                    <Image source={{ uri: member.avatar }} style={styles.avatar} />
                    <View style={styles.infoCol}>
                      <Text style={styles.name}>{member.name}</Text>
                      <Text style={styles.email}>{member.email}</Text>
                    </View>
                    <View style={[styles.badge, badgeStyle.container]}>
                      <Text style={[styles.badgeText, badgeStyle.text]}>{badgeStyle.label}</Text>
                    </View>
                  </View>

                  <View style={styles.metaRow}>
                    <View style={styles.metaChip}>
                      <Text style={styles.metaChipText}>{isAdmin ? 'Administrador' : 'Membro'}</Text>
                    </View>
                    <View style={styles.metaChip}>
                      <Text style={styles.metaChipText}>{member.booksRead} livros lidos</Text>
                    </View>
                    <View style={styles.metaChip}>
                      <Text style={styles.metaChipText}>Desde {member.joinedAt}</Text>
                    </View>
                  </View>

                  <View style={styles.actionsRow}>
                    {canPromote ? (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.actionButtonSoft, isRoleUpdating && { opacity: 0.65 }]}
                        onPress={() => handleToggleRole(member)}
                        disabled={isRoleUpdating}
                        hitSlop={HIT_SLOP}
                        accessibilityRole="button"
                        accessibilityLabel={`Promover ${member.name} para administrador`}
                        accessibilityState={{ disabled: isRoleUpdating, busy: isRoleUpdating }}
                      >
                        {isRoleUpdating ? (
                          <ActivityIndicator size="small" color="#0f766e" />
                        ) : (
                          <Ionicons name="shield-checkmark-outline" size={14} color="#0f766e" />
                        )}
                        <Text style={[styles.actionText, { color: '#0f766e' }]}>
                          {isRoleUpdating ? 'Atualizando...' : 'Promover para admin'}
                        </Text>
                      </TouchableOpacity>
                    ) : null}

                    {canToggleStatus ? (
                      <TouchableOpacity
                        onPress={() => handleToggleStatus(member)}
                        style={[styles.actionButton, styles.actionButtonWarn]}
                        hitSlop={HIT_SLOP}
                        accessibilityRole="button"
                        accessibilityLabel={member.status === 'active' ? `Bloquear ${member.name}` : `Reativar ${member.name}`}
                      >
                        <Ionicons name="ban-outline" size={14} color="#9f1239" />
                        <Text style={[styles.actionText, { color: '#9f1239' }]}>
                          {member.status === 'active' ? 'Bloquear' : 'Reativar'}
                        </Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </View>
              );
            })}
            {members.length === 0 ? (
              <View style={styles.feedbackWrap}>
                <Ionicons name="people-outline" size={28} color="#94a3b8" />
                <Text style={styles.feedbackText}>Nenhum membro encontrado com esses filtros.</Text>
              </View>
            ) : null}
          </ScrollView>
        ) : null}
      </View>

      <FooterNav navigation={navigation} activeKey="membros" items={ADMIN_FOOTER_ITEMS} />
    </View>
  );
}