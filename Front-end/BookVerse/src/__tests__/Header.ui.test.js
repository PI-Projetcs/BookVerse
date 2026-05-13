import React from 'react';
import renderer from 'react-test-renderer';
import Header from '../components/Header';

describe('Header UI and accessibility', () => {
	it('renders title/subtitle and triggers right action when pressed', () => {
		const onRightAction = jest.fn();
		let tree;
		renderer.act(() => {
			tree = renderer.create(
				<Header
					title="BookV"
					subtitle="Dashboard"
					onRightAction={onRightAction}
					rightActionLabel="Sair"
				/>
			);
		});

		const title = tree.root.findAllByType('Text').find((node) => node.props.children === 'BookV');
		const subtitle = tree.root.findAllByType('Text').find((node) => node.props.children === 'Dashboard');
		expect(title).toBeTruthy();
		expect(subtitle).toBeTruthy();

		const actionButton = tree.root
			.findAllByType('TouchableOpacity')
			.find((node) => node.props.accessibilityLabel === 'Sair');
		expect(actionButton).toBeTruthy();
		actionButton.props.onPress();
		expect(onRightAction).toHaveBeenCalledTimes(1);
	});

	it('does not render right action button when callback is absent', () => {
		let tree;
		renderer.act(() => {
			tree = renderer.create(<Header title="BookV" subtitle="Home" rightActionLabel="Sair" />);
		});
		const actionButtons = tree.root
			.findAllByType('TouchableOpacity')
			.filter((node) => node.props.accessibilityLabel === 'Sair');
		expect(actionButtons).toHaveLength(0);
	});
});
