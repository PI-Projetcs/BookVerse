export function formatRatingDate(value) {
	if (!value) {
		return 'Data não informada';
	}

	const parsedDate = new Date(value);
	if (Number.isNaN(parsedDate.getTime())) {
		return 'Data não informada';
	}

	return parsedDate.toLocaleDateString('pt-BR', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
	});
}

export function getRatingAuthor(rating = {}, sessionId) {
	if (sessionId && Number(rating?.userId) === Number(sessionId)) {
		return 'Você';
	}

	return rating?.author || rating?.usuarioNome || 'Leitor(a)';
}

export function getRatingStatusLabel(status) {
	if (status === 'PENDING') {
		return 'Em moderação';
	}

	if (status === 'REJECTED') {
		return 'Rejeitada';
	}

	return 'Publicada';
}

export function renderRatingDistribution(ratings = []) {
	const approvedRatings = Array.isArray(ratings)
		? ratings.filter((item) => !item?.status || item.status === 'APPROVED')
		: [];

	const total = approvedRatings.length;
	const distribution = [5, 4, 3, 2, 1].reduce((accumulator, star) => {
		accumulator[star] = approvedRatings.filter((item) => Number(item?.rating || 0) === star).length;
		return accumulator;
	}, {});

	const average = total
		? approvedRatings.reduce((sum, item) => sum + Number(item?.rating || 0), 0) / total
		: 0;

	const highlyRated = approvedRatings.filter((item) => Number(item?.rating || 0) >= 4).length;

	return {
		average,
		total,
		highlyRated,
		distribution,
	};
}

export function pickFeaturedRatings(ratings = []) {
	const approvedRatings = Array.isArray(ratings)
		? ratings.filter((item) => !item?.status || item.status === 'APPROVED')
		: [];

	return [...approvedRatings]
		.sort((left, right) => {
			const leftHasText = Boolean(String(left?.review || '').trim());
			const rightHasText = Boolean(String(right?.review || '').trim());

			if (leftHasText !== rightHasText) {
				return Number(rightHasText) - Number(leftHasText);
			}

			const ratingDifference = Number(right?.rating || 0) - Number(left?.rating || 0);
			if (ratingDifference !== 0) {
				return ratingDifference;
			}

			const rightDate = new Date(right?.date || right?.updatedAt || right?.createdAt || 0).getTime();
			const leftDate = new Date(left?.date || left?.updatedAt || left?.createdAt || 0).getTime();
			return rightDate - leftDate;
		})
		.slice(0, 3);
}