import React from 'react';
import { shallow, mount } from 'enzyme';
import Button from '../index';


describe('Button', () => {
    const wrapper = shallow(
        <Button
            title="Test"
        />,
    );

    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});

describe('Button', () => {
    const testObject = {};
    const onClick = () => { testObject.clicked = true; };
    const wrapper = mount(
        <Button
            disabled={false}
            onClick={onClick}
        />,
    );

    it('checks if clicked properly', () => {
        console.log(wrapper.props());
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
        console.log(wrapper.props());
    });
});
