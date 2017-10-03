import React from 'react';
import { shallow } from 'enzyme';
import FileInput from '../index';


describe('<FileInput />', () => {
    const wrapper = shallow(
        <FileInput />,
    );

    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});
