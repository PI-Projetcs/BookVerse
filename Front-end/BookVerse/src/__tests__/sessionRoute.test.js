import { getInitialRouteFromSession } from '../navigation/sessionRoute';

describe('getInitialRouteFromSession', () => {
	it('returns Admin for admin role', () => {
		expect(getInitialRouteFromSession({ role: 'admin', token: 'jwt' })).toBe('Admin');
	});

	it('returns Catalog for non-admin role', () => {
		expect(getInitialRouteFromSession({ role: 'member', token: 'jwt' })).toBe('Catalog');
	});

	it('returns Login when session is missing or invalid', () => {
		expect(getInitialRouteFromSession(null)).toBe('Login');
		expect(getInitialRouteFromSession({})).toBe('Login');
		expect(getInitialRouteFromSession({ role: 'member' })).toBe('Login');
	});
});