import React from 'react';
import { shallow, mount } from 'enzyme';
import RadioInput from '../index';


const options = [
    {
        key: '1',
        label: 'Syria Conflict',
    },
    {
        key: '2',
        label: 'Antigua and Barbuda Global Monitoring',
    },
    {
        key: '3',
        label: 'French Polynesia Global Monitoring',
    },
];

describe('RadioInput', () => {
    const wrapper = shallow(
        <RadioInput
            name="RadioInput"
            options={options}
            value="2"
            selected="1"
        />,
    );

    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});
