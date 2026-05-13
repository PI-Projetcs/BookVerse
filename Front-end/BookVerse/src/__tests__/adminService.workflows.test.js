describe('adminService workflows (mock mode)', () => {
	beforeEach(() => {
		jest.resetModules();
		process.env.EXPO_PUBLIC_USE_MOCK = 'true';
	});

	it('updates member role and status', async () => {
		const {
			getAdminMembers,
			updateAdminMemberRole,
			updateAdminMemberStatus,
		} = require('../services/adminService');

		const members = await getAdminMembers({ status: 'all' });
		expect(members.length).toBeGreaterThan(0);

		const target = members[0];
		const nextRole = target.role === 'moderator' ? 'member' : 'moderator';
		const nextStatus = target.status === 'active' ? 'blocked' : 'active';

		const roleUpdated = await updateAdminMemberRole(target.id, nextRole);
		expect(roleUpdated?.role).toBe(nextRole);

		const statusUpdated = await updateAdminMemberStatus(target.id, nextStatus);
		expect(statusUpdated?.status).toBe(nextStatus);
	});

	it('updates moderation item status', async () => {
		const { getModerationItems, setModerationStatus } = require('../services/adminService');

		const items = await getModerationItems({ status: 'all' });
		expect(items.length).toBeGreaterThan(0);

		const target = items[0];
		const updated = await setModerationStatus(target.id, 'approved');

		expect(updated).toBeTruthy();
		expect(updated.status).toBe('approved');
	});
});