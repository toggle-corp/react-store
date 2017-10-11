import React from 'react';
import { shallow, mount } from 'enzyme';
import SelectInput, {Option} from '../index';


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

describe('SelectInput', () => {
    const wrapper = shallow(
        <SelectInput
            options={options}
        />
    );

    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});

describe('SelectInput', () => {
    const wrapper = shallow(
        <SelectInput
            options={options}
            multiple
        />
    );

    it('renders properly for multiple inputs', () => {
        expect(wrapper.length).toEqual(1);
    });
});

// TODO: Write tests when showOptions = true
