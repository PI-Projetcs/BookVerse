module.exports = function (api) {
	const isTest = process.env.NODE_ENV === 'test';
	api.cache.using(() => isTest);

	return {
		presets: isTest
			? [
				['@babel/preset-env', { targets: { node: 'current' } }],
				['@babel/preset-react', { runtime: 'automatic' }],
			]
			: ['babel-preset-expo'],
	};
};