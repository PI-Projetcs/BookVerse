module.exports = {
	testEnvironment: 'node',
	roots: ['<rootDir>/src'],
	testMatch: ['**/__tests__/**/*.test.js'],
	transform: {
		'^.+\\.[jt]sx?$': 'babel-jest',
	},
	moduleFileExtensions: ['js', 'jsx', 'json'],
	setupFilesAfterEnv: ['<rootDir>/src/__tests__/setupTests.js'],
	clearMocks: true,
};