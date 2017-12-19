import React from 'react';
import { shallow } from 'enzyme';
import NonFieldErrors from '../index';

describe('NonFieldErrors', () => {
    const wrapper = shallow(
        <NonFieldErrors />,
    );

    it('renders properly with zero errors', () => {
        expect(wrapper.length).toEqual(1);
    });
});


describe('NonFieldErrors', () => {
    const wrapper = shallow(
        <NonFieldErrors
            errors={['errorA', 'errorB']}
        />,
    );

    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});
