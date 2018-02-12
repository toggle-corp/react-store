import React from 'react';
import { shallow, mount } from 'enzyme';
import Button from '../index';
import PrimaryButton from '../PrimaryButton';
import AccentButton from '../AccentButton';
import SuccessButton from '../SuccessButton';
import DangerButton from '../DangerButton';
import WarningButton from '../WarningButton';

describe('Button', () => {
    const testObject = {};
    const onClick = () => { testObject.clicked = true; };
    const wrapper = mount(
        <Button
            disabled={false}
            onClick={onClick}
        >
            Button
        </Button>,
    );

    it('checks if clicked properly', () => {
        // console.log(wrapper.props());
        wrapper.setProps({
            disabled: true,
        });
        wrapper.find('button').simulate('click');
        expect(testObject.clicked).toBeFalsy();
        wrapper.setProps({
            disabled: false,
        });
        wrapper.find('button').simulate('click');
        expect(testObject.clicked).toBeTruthy();
        // console.log(wrapper.props());
    });
});


describe('Button', () => {
    const wrapper = shallow(
        <Button
            title="Test"
            className="test"
            iconName="test"
        >
            Button
        </Button>,
    );
    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});

describe('PrimaryButton', () => {
    const wrapper = shallow(
        <PrimaryButton
            title="Test"
            className="test"
            iconName="test"
        >
            PrimaryButton
        </PrimaryButton>,
    );
    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});

describe('AccentButton', () => {
    const wrapper = shallow(
        <AccentButton
            title="Test"
            className="test"
            iconName="test"
        >
            AccentButton
        </AccentButton>,
    );
    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});

describe('SuccessButton', () => {
    const wrapper = shallow(
        <SuccessButton
            title="Test"
            className="test"
            iconName="test"
        >
            SuccessButton
        </SuccessButton>,
    );
    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});

describe('DangerButton', () => {
    const wrapper = shallow(
        <DangerButton
            title="Test"
            className="test"
            iconName="test"
        >
            DangerButton
        </DangerButton>,
    );
    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});

describe('WarningButton', () => {
    const wrapper = shallow(
        <WarningButton
            title="Test"
            className="test"
            iconName="test"
        >
            WarningButton
        </WarningButton>,
    );
    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});
