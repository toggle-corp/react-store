import React from 'react';
import { shallow } from 'enzyme';
import FileInput from '../index';


describe('<FileInput />', () => {
    const onChange = (files) => { console.log(files.length); };
    const wrapper = shallow(
        <FileInput
            onChange={onChange}
        >
            Open File
        </FileInput>,
    );

    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});
