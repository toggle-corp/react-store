import React from 'react';
import { shallow, mount } from 'enzyme';
import SegmentButton from '../index';

describe('SegmentButton', () => {
    const testObject = {};
    const onPress = (val) => { testObject.clicked = val; };
    const wrapper = mount(
        <SegmentButton
            disabled={false}
            data={[
                { value: '1', label: 1 },
                { value: '2', label: 2 },
            ]}
            selected="2"
            onPress={onPress}
        />,
    );

    it('checks if clicked properly', () => {
        // console.log(wrapper.props());
        wrapper.setProps({
            selected: '2',
        });

        wrapper.find('input').at(0).simulate('change');
        expect(wrapper.state('selectedValue')).toEqual('1');
    });
});
