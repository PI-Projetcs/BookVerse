describe('adminService workflows (mock mode)', () => {
	beforeEach(() => {
		jest.resetModules();
	});

	it('updates member role and status', async () => {
		const {
			getAdminMembers,
			promoteAdminMember,
			updateAdminMemberStatus,
		} = require('../services/adminService');

		const members = await getAdminMembers({ status: 'all' });
		expect(members.length).toBeGreaterThan(0);

		const target = members[0];
		const nextStatus = target.status === 'active' ? 'blocked' : 'active';

		const roleUpdated = await promoteAdminMember(target.id);
		expect(roleUpdated?.role).toBe('admin');

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