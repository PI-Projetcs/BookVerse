describe('profileService workflows (mock mode)', () => {
  let profileService;

  beforeEach(() => {
    jest.resetModules();
    profileService = require('../services/profileService');
  });

  describe('getUserProfile', () => {
    it('retrieves the current user profile with all fields', async () => {
      const profile = await profileService.getUserProfile();

      expect(profile).toBeTruthy();
      expect(profile.id).toBeDefined();
      expect(profile.name).toBeDefined();
      expect(profile.email).toBeDefined();
      expect(profile.bio).toBeDefined();
      expect(profile.profilePicture).toBeDefined();
      expect(profile.stats).toBeDefined();
      expect(profile.destaque).toEqual(expect.any(Array));
      expect(profile.categorias).toEqual(expect.any(Array));
    });

    it('returns normalized profile data with proper casing', async () => {
      const profile = await profileService.getUserProfile();

      expect(profile).toHaveProperty('id');
      expect(profile).toHaveProperty('name');
      expect(profile).toHaveProperty('email');
      expect(profile).toHaveProperty('bio');
      expect(profile).toHaveProperty('profilePicture');
      expect(profile).toHaveProperty('stats');
      expect(profile).toHaveProperty('destaque');
      expect(profile).toHaveProperty('categorias');
    });

    it('returns consistent user stats', async () => {
      const profile = await profileService.getUserProfile();

      expect(profile.stats).toHaveProperty('livrosLidos');
      expect(profile.stats).toHaveProperty('favoritos');
      expect(profile.stats).toHaveProperty('resenhas');
      expect(typeof profile.stats.livrosLidos).toBe('number');
    });
  });

  describe('updateUserProfile', () => {
    it('updates user profile with new name and email', async () => {
      const updated = await profileService.updateUserProfile({
        name: 'Novo Nome',
        email: 'novo@email.com',
        bio: 'Nova biografia',
      });

      expect(updated.name).toBe('Novo Nome');
      expect(updated.email).toBe('novo@email.com');
      expect(updated.bio).toBe('Nova biografia');
    });

    it('normalizes email to lowercase', async () => {
      const updated = await profileService.updateUserProfile({
        name: 'Test User',
        email: 'TEST@EMAIL.COM',
      });

      expect(updated.email).toBe('test@email.com');
    });

    it('updates profile picture URL', async () => {
      const newImageUrl = 'https://example.com/new-profile.jpg';
      const updated = await profileService.updateUserProfile({
        name: 'Test User',
        profilePicture: newImageUrl,
      });

      expect(updated.profilePicture).toBe(newImageUrl);
    });

    it('returns normalized updated profile data', async () => {
      const updated = await profileService.updateUserProfile({
        name: 'Updated Name',
        email: 'updated@email.com',
        bio: 'Updated bio',
      });

      expect(updated).toHaveProperty('id');
      expect(updated).toHaveProperty('name');
      expect(updated).toHaveProperty('email');
      expect(updated).toHaveProperty('bio');
      expect(updated).toHaveProperty('stats');
    });
  });

  describe('changePassword', () => {
    it('validates new password length requirement', async () => {
      try {
        await profileService.changePassword('oldPass', 'short');
        fail('Should reject password shorter than 6 characters');
      } catch (error) {
        expect(error.message).toContain('mínimo');
      }
    });

    it('succeeds with valid password change in mock mode', async () => {
      const result = await profileService.changePassword('oldPassword123', 'newPassword123');

      expect(result.success).toBe(true);
      expect(result.message).toContain('sucesso');
    });
  });

  describe('getUserStats', () => {
    it('retrieves user reading statistics', async () => {
      const stats = await profileService.getUserStats();

      expect(stats).toHaveProperty('livrosLidos');
      expect(stats).toHaveProperty('favoritos');
      expect(stats).toHaveProperty('resenhas');
    });

    it('returns numeric values for all stats', async () => {
      const stats = await profileService.getUserStats();

      expect(typeof stats.livrosLidos).toBe('number');
      expect(typeof stats.favoritos).toBe('number');
      expect(typeof stats.resenhas).toBe('number');
    });
  });

  describe('addCategoryPreference', () => {
    it('adds a new genre preference to user profile', async () => {
      const updated = await profileService.addCategoryPreference('Fantasia');

      expect(updated.categorias).toContain('Fantasia');
      expect(updated.categorias).toEqual(expect.any(Array));
    });

    it('does not add duplicate category preferences', async () => {
      const updated1 = await profileService.addCategoryPreference('Romance');
      const updated2 = await profileService.addCategoryPreference('Romance');

      const countRomance = updated2.categorias.filter(c => c === 'Romance').length;
      expect(countRomance).toBe(1);
    });
  });

  describe('removeCategoryPreference', () => {
    it('removes a genre preference from user profile', async () => {
      await profileService.addCategoryPreference('Terror');
      
      const updated = await profileService.removeCategoryPreference('Terror');

      expect(updated.categorias).not.toContain('Terror');
    });

    it('handles removal of non-existent categories gracefully', async () => {
      const updated = await profileService.removeCategoryPreference('NonExistentGenre');

      expect(updated).toHaveProperty('categorias');
      expect(updated.categorias).toEqual(expect.any(Array));
    });
  });

  describe('updateProfilePicture', () => {
    it('requires an image URI', async () => {
      try {
        await profileService.updateProfilePicture(null);
        fail('Should throw error for missing URI');
      } catch (error) {
        expect(error.message).toContain('obrigatório');
      }
    });

    it('updates user profile picture with image URI', async () => {
      const imageUri = 'file:///documents/pictures/profile.jpg';
      const updated = await profileService.updateProfilePicture(imageUri);

      expect(updated.profilePicture).toBe(imageUri);
    });
  });

  describe('profile service integration (RF10)', () => {
    it('supports full profile management workflow for users', async () => {
      const initial = await profileService.getUserProfile();
      expect(initial).toBeTruthy();

      const updated = await profileService.updateUserProfile({
        name: 'Updated User',
        email: 'user@updated.com',
        bio: 'I love reading',
      });
      expect(updated.name).toBe('Updated User');

      const withPrefs = await profileService.addCategoryPreference('Ficção Científica');
      expect(withPrefs.categorias).toContain('Ficção Científica');

      const stats = await profileService.getUserStats();
      expect(stats.livrosLidos).toBeDefined();

      const pwdResult = await profileService.changePassword('oldPwd', 'newPwd123');
      expect(pwdResult.success).toBe(true);
    });

    it('persists profile updates within session', async () => {
      const newName = 'Persistent User';
      await profileService.updateUserProfile({
        name: newName,
      });

      const retrieved = await profileService.getUserProfile();
      expect(retrieved.name).toBe(newName);
    });
  });

  describe('achievement visibility and progress (RF17)', () => {
    it('lists the user achievements catalog and updates progress from reading activity', async () => {
      const profile = await profileService.getUserProfile();
      expect(profile.achievements).toEqual(expect.any(Array));

      const beforeCatalog = await profileService.getAchievementsCatalog();
      const beforeProgress = beforeCatalog.find((item) => item.id === 104);
      expect(beforeProgress).toMatchObject({
        id: 104,
        currentValue: 0,
        completed: false,
      });

      await profileService.addFavoriteBook(1);
      await profileService.addFavoriteBook(2);
      await profileService.addFavoriteBook(3);

      const afterCatalog = await profileService.getAchievementsCatalog();
      const afterProgress = afterCatalog.find((item) => item.id === 104);
      expect(afterProgress).toMatchObject({
        id: 104,
        currentValue: 3,
        completed: true,
      });

      const userAchievements = await profileService.getUserAchievements();
      expect(Array.isArray(userAchievements)).toBe(true);
    });
  });
});
