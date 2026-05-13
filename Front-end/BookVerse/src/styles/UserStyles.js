import { StyleSheet } from 'react-native';

export const CATEGORY_GRADIENTS = [
  ['#6B0F2E', '#3B0A18'],
  ['#0D4D4D', '#0A3D3D'],
  ['#B8941F', '#8A6D10'],
  ['#1e3a5f', '#152d4a'],
];

export const styles = StyleSheet.create({
  // ─── Layout ───────────────────────────────────────────────────────────────
  screen: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    flex: 1,
  },
  contentInner: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 16,
  },

  // ─── Card base (reused by varios sections) ────────────────────────────────
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 14,
    marginBottom: 14,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
  },

  // ─── Profile card ─────────────────────────────────────────────────────────
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#7D1F3E',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  profileUsername: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  profileBio: {
    fontSize: 12,
    color: '#374151',
    marginTop: 6,
    lineHeight: 17,
  },

  // ─── Search ───────────────────────────────────────────────────────────────
  searchContainer: {
    height: 44,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 40,
    paddingRight: 12,
    marginBottom: 14,
  },
  searchIcon: {
    position: 'absolute',
    left: 13,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },

  // ─── Stats row ────────────────────────────────────────────────────────────
  statsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statValue: {
    fontWeight: '800',
    fontSize: 20,
    color: '#111827',
  },
  statLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 3,
    textAlign: 'center',
  },

  // ─── Livro do mês ─────────────────────────────────────────────────────────
  bookOfMonth: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  bookOfMonthHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  bookOfMonthTitle: {
    fontWeight: '800',
    fontSize: 14,
    color: '#ffffff',
  },
  bookOfMonthContent: {
    flexDirection: 'row',
    gap: 12,
  },
  bookCover: {
    width: 80,
    height: 120,
    borderRadius: 8,
  },
  bookInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  bookTitle: {
    fontWeight: '800',
    fontSize: 15,
    color: '#ffffff',
  },
  bookAuthor: {
    fontSize: 12,
    color: 'rgba(254,243,199,0.85)',
    marginTop: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 10,
  },
  ratingText: {
    fontSize: 13,
    color: '#fef3c7',
    fontWeight: '700',
  },
  readersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  readersText: {
    fontSize: 12,
    color: 'rgba(254,243,199,0.8)',
  },

  // ─── Section ──────────────────────────────────────────────────────────────
  section: {
    marginBottom: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontWeight: '800',
    fontSize: 14,
    color: '#111827',
  },
  seeAll: {
    color: '#7D1F3E',
    fontSize: 12,
    fontWeight: '700',
  },

  // ─── Categories ───────────────────────────────────────────────────────────
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryCard: {
    width: '48%',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },

  // ─── Featured books grid ─────────────────────────────────────────────────
  featuredGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featuredCard: {
    width: '47%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },
  featuredImage: {
    width: '100%',
    height: 160,
  },
  featuredInfo: {
    padding: 10,
  },
  featuredTitle: {
    color: '#111827',
    fontWeight: '700',
    fontSize: 13,
  },
  featuredAuthor: {
    color: '#6b7280',
    fontSize: 11,
    marginTop: 3,
  },
  featuredMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  featuredStarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  featuredRatingText: {
    color: '#6b7280',
    fontSize: 11,
  },
  featuredTag: {
    backgroundColor: 'rgba(13,77,77,0.12)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  featuredTagText: {
    color: '#0f766e',
    fontSize: 10,
    fontWeight: '700',
  },

  // ─── Reading activity card ─────────────────────────────────────────────────
  activityCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 14,
    marginBottom: 14,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
  },
  activityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  activityTitle: {
    color: '#111827',
    fontWeight: '800',
    fontSize: 14,
  },
  activityItem: {
    marginBottom: 12,
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  activityMonth: {
    color: '#6b7280',
    fontSize: 13,
  },
  activityBooks: {
    color: '#111827',
    fontWeight: '700',
    fontSize: 13,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 100,
  },
  progress: {
    height: '100%',
    borderRadius: 100,
  },
});