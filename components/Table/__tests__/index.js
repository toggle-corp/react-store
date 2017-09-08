import React from 'react';
import { shallow } from 'enzyme';
import Table from '../index';


describe('<Table />', () => {
    const tableData = [
        { a: 'b', c: 'd' },
        { a: 'e', c: 'f' },
    ];
    const tableHeaders = [
        { a: '1', c: '2' },
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
