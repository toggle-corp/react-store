import React from 'react';
import { mount } from 'enzyme';
import DateInput from '../index';
import {
    FormattedDate,
} from '../../../View';


describe('DateInput', () => {
    const initialValue = '2017-08-11';

    const wrapper = mount(
        <DateInput
            initialValue={initialValue}
            format="d/m/y"
            label="Published at"
            styleName="date-input"
            required
        />,
    );

    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });

    it('returns proper date', () => {
        expect(wrapper.instance().getValue())
            .toEqual(initialValue);
    });

    it('has working today button', () => {
        const today = FormattedDate.format(new Date(), 'yyyy-MM-dd');

        wrapper.find('.today-button').simulate('click');
        expect(wrapper.instance().getValue())
            .toEqual(today);
    });

    it('has working clear button', () => {
        wrapper.find('.clear-button').simulate('click');
        expect(wrapper.instance().getValue())
            .toEqual(undefined);
    });

    // TODO: Test date picker
});
