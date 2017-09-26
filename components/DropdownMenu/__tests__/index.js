import React from 'react';
import { shallow } from 'enzyme';
import DropdownMenu from '../index';


describe('<DropdownMenu />', () => {
    const wrapper = shallow(
        <DropdownMenu title="Test">Test</DropdownMenu>,
    );

    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});
