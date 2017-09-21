import React from 'react';
import { shallow } from 'enzyme';
import Table from '../index';


describe('<Table />', () => {
    const tableHeaders = [
        { key: 'a', label: 'atest', order: 1 },
        { key: 'b', label: 'btest', order: 2 },
    ];
    const tableData = [
        { a: 'a1', b: 'b1' },
        { a: 'a2', b: 'b2' },
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
