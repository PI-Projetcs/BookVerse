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
		StyleSheet: { create: (styles) => styles },
		Alert: { alert: jest.fn() },
	};
});

jest.mock('expo-linear-gradient', () => {
	const React = require('react');
	return {
		LinearGradient: ({ children, ...props }) => React.createElement('LinearGradient', props, children),
	};
});

jest.mock('react-native-safe-area-context', () => ({
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
