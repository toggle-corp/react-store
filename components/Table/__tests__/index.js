import React from 'react';
import { shallow, mount } from 'enzyme';
import Table from '../index';

describe('Table', () => {
    const tableHeaders = [
        { key: 'a', label: 'atest', order: 1 },
        { key: 'b', label: 'btest', order: 2 },
    ];
    const tableData = [
        { a: 5, b: 67 },
        { a: 44, b: 823 },
        { a: 44, b: 823 },
        { a: 34, b: 1 },
    ];

    const wrapper = shallow(
        <Table
            data={tableData}
            headers={tableHeaders}
        />,
    );

    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});

describe('Table Header', () => {
    const tableHeaders = [
        {
            key: 'a',
            label: 'atest',
            order: 1,
            sortable: true,
            comparator: (a, b) => a.a - b.a,
        },
        {
            key: 'b',
            label: 'btest',
            order: 2,
        },
    ];
    const tableData = [
        { a: 5, b: 67 },
        { a: 44, b: 13 },
        { a: 6, b: 29 },
        { a: 84, b: 21 },
    ];

    const ascData = [
        { a: 5, b: 67 },
        { a: 6, b: 29 },
        { a: 44, b: 13 },
        { a: 84, b: 21 },
    ];

    const dscData = [
        { a: 84, b: 21 },
        { a: 44, b: 13 },
        { a: 6, b: 29 },
        { a: 5, b: 67 },
    ];

    const wrapper = mount(
        <Table
            data={tableData}
            headers={tableHeaders}
        />,
    );

    it('sorts properly', () => {
        console.log(wrapper.state('data'));
        const thead = wrapper.find('thead');
        const th = thead.find('th');
        th.first().simulate('click');
        console.log(wrapper.state('data'));
        expect(wrapper.state('data')).toEqual(dscData);
        th.first().simulate('click');
        console.log(wrapper.state('data'));
        expect(wrapper.state('data')).toEqual(ascData);
    });
});
