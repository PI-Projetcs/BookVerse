export function getInitialRouteFromSession(session) {
	if (!session?.token || !session?.role) {
		return 'Login';
	}

	if (session?.role === 'admin') {
		return 'Admin';
	}

	return 'Catalog';
}