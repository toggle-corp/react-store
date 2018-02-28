import React from 'react';
import { mount } from 'enzyme';
import DateInput from '../index';

describe('DateInput', () => {
    const initialValue = '2017-08-11';

    const wrapper = mount(
        <DateInput
            initialValue={initialValue}
            format="d/m/y"
            label="Published at"
            required
        />,
    );

    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});
