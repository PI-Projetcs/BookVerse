jest.mock('react-native', () => {
	const React = require('react');

	const makeComponent = (name) => {
		const Component = ({ children, ...props }) => React.createElement(name, props, children);
		Component.displayName = name;
		return Component;
	};

	return {
		View: makeComponent('View'),
		Text: makeComponent('Text'),
		TouchableOpacity: makeComponent('TouchableOpacity'),
		TextInput: makeComponent('TextInput'),
		ScrollView: makeComponent('ScrollView'),
		Image: makeComponent('Image'),
		StatusBar: makeComponent('StatusBar'),
		ActivityIndicator: makeComponent('ActivityIndicator'),
		SafeAreaView: makeComponent('SafeAreaView'),
		StyleSheet: { create: (styles) => styles },
		Alert: { alert: jest.fn() },
		Platform: { OS: 'web', select: (options) => options?.web ?? options?.default },
	};
});

jest.mock('expo-constants', () => ({
	__esModule: true,
	default: {
		expoConfig: {
			hostUri: '127.0.0.1:8081',
		},
	},
}));

jest.mock('expo-linear-gradient', () => {
	const React = require('react');
	return {
		LinearGradient: ({ children, ...props }) => React.createElement('LinearGradient', props, children),
	};
});

jest.mock('react-native-safe-area-context', () => ({
	SafeAreaView: ({ children, ...props }) => {
		const React = require('react');
		return React.createElement('SafeAreaView', props, children);
	},
	useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('@expo/vector-icons', () => {
	const React = require('react');
	const { Text } = require('react-native');

	const MockIcon = ({ name = 'icon' }) => React.createElement(Text, null, String(name));

	return {
		Ionicons: MockIcon,
		MaterialCommunityIcons: MockIcon,
		Feather: MockIcon,
	};
});

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
