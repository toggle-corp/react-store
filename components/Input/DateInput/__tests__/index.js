import React from 'react';
import { mount } from 'enzyme';
import DateInput from '../index';


describe('DateInput', () => {
    const initialValue = new Date('2017-08-11').getTime();

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
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        wrapper.find('.today-button').simulate('click');
        expect(wrapper.instance().getValue())
            .toEqual(today.getTime());
    });

    it('has working clear button', () => {
        wrapper.find('.clear-button').simulate('click');
        expect(wrapper.instance().getValue())
            .toEqual(null);
    });

    // TODO: Test date picker
});
