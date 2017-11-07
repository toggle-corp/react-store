import React from 'react';
import { shallow } from 'enzyme';
import MultiCheckboxCollection from '../index';

describe('MultiCheck Collection', () => {
    const sample = [
        {
            key: 'rzjesources',
            title: 'Resource',
            options: [
                {
                    key: 'stapler',
                    title: 'Satappler',
                    isChecked: false,
                },
                {
                    key: 'scales',
                    title: 'SCALAS',
                    isChecked: true,
                },
                {
                    key: 'Duster',
                    title: 'Duster',
                    isChecked: false,
                },
                {
                    key: 'Chalk',
                    title: 'Chalked',
                    isChecked: true,
                },
            ],
        },
        {
            key: 'Chain',
            title: 'Chainss',
            isChecked: false,
        },
        {
            key: 'Supply',
            title: 'Supplies',
            options: [
                {
                    key: 'sapler',
                    title: 'Saler',
                    isChecked: true,
                },
                {
                    key: 'scals',
                    title: 'SLAS',
                    isChecked: true,
                },
                {
                    key: 'Duster',
                    title: 'Duster',
                    isChecked: false,
                },
                {
                    key: 'Chalk',
                    title: 'Chalked',
                    isChecked: false,
                },
            ],
        },
    ];
    const wrapper = shallow(
        <MultiCheckboxCollection
            options={sample}
            onChange={() => {}}
        />,
    );

    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});
