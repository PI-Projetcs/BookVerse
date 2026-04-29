import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },

  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#B8941F',
  },

  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fefce8',
    marginLeft: 16,
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerActionSpacing: {
    marginLeft: 8,
  },

  bookSubtitle: {
    color: '#fcd34d',
    fontSize: 12,
    marginLeft: 38,
    fontWeight: '600',
  },

  moderationButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },

  scrollView: {
    flex: 1,
  },

  chapterCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  chapterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },

  chapterInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  chapterBadge: {
    backgroundColor: '#6B7C59',
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  chapterBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },

  chapterTitleContainer: {
    flex: 1,
  },

  chapterTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },

  chapterCommentCount: {
    fontSize: 13,
    color: '#64748b',
  },

  commentsSection: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    padding: 16,
  },

  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },

  sortLabel: {
    fontSize: 13,
    color: '#64748b',
    marginRight: 10,
    fontWeight: '500',
  },

  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
  },

  filterButtonMuted: {
    backgroundColor: '#e2e8f0',
  },

  filterButtonSelected: {
    backgroundColor: '#6B0F2E',
  },

  filterTextMuted: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '700',
  },

  filterTextSelected: {
    color: '#f8fafc',
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },

  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginTop: 12,
  },

  emptyStateSubtext: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center',
  },

  commentCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
  },

  commentHeader: {
    marginBottom: 8,
  },

  commentProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },

  commentProfileText: {
    flex: 1,
  },

  commentAuthor: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },

  commentTime: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },

  commentText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
    marginBottom: 12,
  },

  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },

  reportButton: {
    marginLeft: 'auto',
    marginRight: 0,
  },

  actionText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
    marginLeft: 4,
  },

  actionTextActive: {
    color: '#7D1F3E',
  },

  newCommentForm: {
    marginTop: 8,
  },

  textInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#0f172a',
    minHeight: 90,
    textAlignVertical: 'top',
  },

  submitButton: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 10,
    overflow: 'hidden',
  },

  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  submitButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 8,
  },

  bottomSpacer: {
    height: 100,
  },

  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0b1f2a',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 2,
    borderTopColor: '#eab308',
  },

  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  navItemActive: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7c3a1d',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eab308',
  },

  navLabel: {
    color: '#fff',
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
  },
});

export default styles;