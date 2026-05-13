import React from 'react';
import renderer from 'react-test-renderer';
import { Alert } from 'react-native';
import FooterNav from '../components/FooterNav';

describe('FooterNav UI and accessibility', () => {
	beforeEach(() => {
		jest.spyOn(Alert, 'alert').mockImplementation(() => {});
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('navigates when route exists', () => {
		const navigate = jest.fn();
		const navigation = {
			navigate,
			getState: () => ({ routeNames: ['Home', 'Catalog', 'Discussion', 'Profile'] }),
		};

		let tree;
		renderer.act(() => {
			tree = renderer.create(<FooterNav navigation={navigation} activeKey="livros" />);
		});
		const homeButton = tree.root
			.findAllByType('TouchableOpacity')
			.find((node) => node.props.accessibilityLabel === 'Ir para Início');

		homeButton.props.onPress();
		expect(navigate).toHaveBeenCalledWith('Home');
	});

	it('shows feedback alert when route is unavailable', () => {
		const navigate = jest.fn();
		const navigation = {
			navigate,
			getState: () => ({ routeNames: ['Catalog'] }),
		};

		let tree;
		renderer.act(() => {
			tree = renderer.create(<FooterNav navigation={navigation} activeKey="livros" />);
		});
		const discussionButton = tree.root
			.findAllByType('TouchableOpacity')
			.find((node) => node.props.accessibilityLabel === 'Ir para Discussão');

		discussionButton.props.onPress();

		expect(navigate).not.toHaveBeenCalled();
		expect(Alert.alert).toHaveBeenCalledTimes(1);
	});
});
