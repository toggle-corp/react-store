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
            selected="1"
        />
    );

    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});

describe('RadioInput', () => {
    const wrapper = mount(
        <RadioInput
            name="RadioInput"
            options={options}
            selected="3"
        />
    );

    it('switches options properly', () => {
        wrapper.find('input').at(0).simulate('click');
        expect(wrapper.state('selectedOption')).toEqual({"key": "1", "label": "Syria Conflict"});
        wrapper.find('input').at(1).simulate('click');
        expect(wrapper.state('selectedOption')).toEqual({"key": "2", "label": "Antigua and Barbuda Global Monitoring"});
        wrapper.find('input').at(2).simulate('click');
        expect(wrapper.state('selectedOption')).toEqual({"key": "3", "label": "French Polynesia Global Monitoring"});
;
    });
});
