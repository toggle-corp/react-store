import React from 'react';
import { shallow } from 'enzyme';
import LoadingAnimation from '../index';

describe('LoadingAnimation', () => {
    const wrapper = shallow(
        <LoadingAnimation />,
    );

    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});
