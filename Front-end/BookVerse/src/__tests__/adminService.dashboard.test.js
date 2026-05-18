describe('adminService dashboard workflows (mock mode - RF11)', () => {
  let adminService;

  beforeEach(() => {
    jest.resetModules();
    adminService = require('../services/adminService');
  });

  describe('getAdminDashboard', () => {
    it('returns dashboard statistics for admin users', async () => {
      const result = await adminService.getAdminDashboard();

      expect(result).toBeTruthy();
      expect(result.item).toBeTruthy();
      expect(result.item).toHaveProperty('totalUsers');
      expect(result.item).toHaveProperty('totalBooks');
      expect(result.item).toHaveProperty('totalDiscussions');
      expect(result.item).toHaveProperty('pendingModerations');
    });

    it('includes all required dashboard metrics', async () => {
      const { item: dashboard } = await adminService.getAdminDashboard();

      expect(dashboard).toHaveProperty('totalUsers');
      expect(dashboard).toHaveProperty('totalBooks');
      expect(dashboard).toHaveProperty('totalDiscussions');
      expect(dashboard).toHaveProperty('pendingModerations');
      expect(dashboard).toHaveProperty('activeUsers');
      expect(dashboard).toHaveProperty('booksThisMonth');
      expect(dashboard).toHaveProperty('discussionsThisMonth');
      expect(dashboard).toHaveProperty('averageRating');
    });

    it('returns numeric values for all metrics', async () => {
      const { item: dashboard } = await adminService.getAdminDashboard();

      expect(typeof dashboard.totalUsers).toBe('number');
      expect(typeof dashboard.totalBooks).toBe('number');
      expect(typeof dashboard.totalDiscussions).toBe('number');
      expect(typeof dashboard.pendingModerations).toBe('number');
      expect(typeof dashboard.activeUsers).toBe('number');
      expect(typeof dashboard.booksThisMonth).toBe('number');
      expect(typeof dashboard.discussionsThisMonth).toBe('number');
      expect(typeof dashboard.averageRating).toBe('number');
    });

    it('shows realistic dashboard data', async () => {
      const { item: dashboard } = await adminService.getAdminDashboard();

      expect(dashboard.totalUsers).toBeGreaterThanOrEqual(0);
      expect(dashboard.totalBooks).toBeGreaterThanOrEqual(0);
      expect(dashboard.totalDiscussions).toBeGreaterThanOrEqual(0);
      expect(dashboard.pendingModerations).toBeGreaterThanOrEqual(0);
      expect(dashboard.activeUsers).toBeGreaterThanOrEqual(0);

      expect(dashboard.activeUsers).toBeLessThanOrEqual(dashboard.totalUsers);

      expect(dashboard.averageRating).toBeGreaterThanOrEqual(0);
      expect(dashboard.averageRating).toBeLessThanOrEqual(5);
    });

    it('provides normalized dashboard data regardless of backend format', async () => {
      const result = await adminService.getAdminDashboard();
      const { item: dashboard } = result;

      expect(dashboard.totalUsers).toEqual(expect.any(Number));
      expect(dashboard.activeUsers).toEqual(expect.any(Number));
      expect(dashboard.booksThisMonth).toEqual(expect.any(Number));
    });
  });

  describe('admin dashboard metrics interpretation', () => {
    it('supports viewing user engagement metrics', async () => {
      const { item: dashboard } = await adminService.getAdminDashboard();

      const userEngagementRate = dashboard.activeUsers / dashboard.totalUsers;
      expect(userEngagementRate).toBeGreaterThanOrEqual(0);
      expect(userEngagementRate).toBeLessThanOrEqual(1);
    });

    it('supports viewing content growth metrics', async () => {
      const { item: dashboard } = await adminService.getAdminDashboard();

      expect(dashboard.booksThisMonth).toBeDefined();
      expect(dashboard.discussionsThisMonth).toBeDefined();
      expect(dashboard.totalBooks).toBeGreaterThanOrEqual(dashboard.booksThisMonth);
      expect(dashboard.totalDiscussions).toBeGreaterThanOrEqual(dashboard.discussionsThisMonth);
    });

    it('supports viewing moderation queue status', async () => {
      const { item: dashboard } = await adminService.getAdminDashboard();

      expect(dashboard.pendingModerations).toBeDefined();
      expect(dashboard.pendingModerations).toBeLessThan(1000);
    });

    it('supports viewing platform quality metrics', async () => {
      const { item: dashboard } = await adminService.getAdminDashboard();

      expect(dashboard.averageRating).toBeGreaterThan(0);
      expect(dashboard.averageRating).toBeLessThanOrEqual(5);
    });
  });

  describe('admin dashboard with member and content management (RF11 integration)', () => {
    it('allows admin to view overall platform statistics', async () => {
      const dashboard = await adminService.getAdminDashboard();
      expect(dashboard.item).toBeTruthy();

      const members = await adminService.getAdminMembers();
      expect(members).toBeTruthy();
      expect(Array.isArray(members) || Array.isArray(members?.items)).toBe(true);
    });

    it('provides metrics for admin content management', async () => {
      const dashboard = await adminService.getAdminDashboard();
      const { item: stats } = dashboard;

      expect(stats.totalBooks).toBeDefined();
      expect(stats.booksThisMonth).toBeDefined();
    });

    it('provides metrics for moderation decisions', async () => {
      const dashboard = await adminService.getAdminDashboard();
      const { item: stats } = dashboard;

      expect(stats.pendingModerations).toBeDefined();

      const moderationWorkload = stats.pendingModerations;
      expect(moderationWorkload).toEqual(expect.any(Number));
    });

    it('enables admin view of platform health', async () => {
      const dashboard = await adminService.getAdminDashboard();
      const { item: stats } = dashboard;

      expect(stats.totalUsers).toBeGreaterThan(0);
      expect(stats.totalBooks).toBeGreaterThan(0);

      expect(stats.activeUsers).toBeDefined();
      expect(stats.discussionsThisMonth).toBeDefined();

      expect(stats.averageRating).toBeGreaterThan(0);
    });
  });

  describe('admin dashboard workflow (RF11 - Manage Admin Dashboard)', () => {
    it('admin can access the dashboard to monitor platform', async () => {
      const result = await adminService.getAdminDashboard();

      expect(result).toBeTruthy();
      expect(result.item).toBeTruthy();
      expect(typeof result.item.totalUsers).toBe('number');
    });

    it('dashboard shows metrics for decision making', async () => {
      const { item: dashboard } = await adminService.getAdminDashboard();

      const metrics = {
        users: dashboard.totalUsers,
        books: dashboard.totalBooks,
        discussions: dashboard.totalDiscussions,
        pendingModerations: dashboard.pendingModerations,
        activity: {
          booksThisMonth: dashboard.booksThisMonth,
          discussionsThisMonth: dashboard.discussionsThisMonth,
        },
        quality: dashboard.averageRating,
      };

      expect(metrics.users).toBeGreaterThanOrEqual(0);
      expect(metrics.pendingModerations).toBeDefined();
      expect(metrics.quality).toBeDefined();
    });

    it('admin can use dashboard to assess moderation needs', async () => {
      const dashboard = await adminService.getAdminDashboard();
      const { item: stats } = dashboard;

      expect(stats.pendingModerations).toBeDefined();

      const moderations = await adminService.getModerationItems();
      expect(moderations).toBeTruthy();
    });

    it('admin can monitor content creation trends', async () => {
      const { item: dashboard } = await adminService.getAdminDashboard();

      const monthlyBooks = dashboard.booksThisMonth;
      const monthlyDiscussions = dashboard.discussionsThisMonth;
      const totalBooks = dashboard.totalBooks;

      expect(monthlyBooks).toBeLessThanOrEqual(totalBooks);
      expect(monthlyDiscussions).toBeLessThanOrEqual(dashboard.totalDiscussions);
    });

    it('admin workflow: view dashboard → manage members → manage books → handle moderation', async () => {
      const dashboard = await adminService.getAdminDashboard();
      expect(dashboard.item).toBeTruthy();

      const pendingCount = dashboard.item.pendingModerations;
      expect(pendingCount).toBeDefined();

      const members = await adminService.getAdminMembers();
      // getAdminMembers returns array directly in mock mode
      expect(Array.isArray(members)).toBe(true);

      const moderations = await adminService.getModerationItems();
      expect(moderations).toEqual(expect.any(Array));

      if (moderations.length > 0) {
        const firstItem = moderations[0];
        const updated = await adminService.setModerationStatus(firstItem.id, 'approved');
        expect(updated).toBeTruthy();
      }
    });
  });
});
