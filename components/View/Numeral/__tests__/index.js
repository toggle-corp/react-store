import React from 'react';
import { shallow } from 'enzyme';
import Numeral, {
    ColoredNumeral,
} from '../index';


describe('ColoredNumeral with Block', () => {
    const wrapper = shallow(
        <ColoredNumeral label="test" inBlock referenceLine={0} value={12} />,
    );
    it('renders properly when empty', () => {
        expect(wrapper.length).toEqual(1);
    });
});

describe('ColoredNumeral with Block', () => {
    const wrapper = shallow(
        <ColoredNumeral inBlock referenceLine={0} value={-12} />,
    );
    it('renders properly when empty', () => {
        expect(wrapper.length).toEqual(1);
    });
});

describe('ColoredNumeral', () => {
    const wrapper = shallow(
        <ColoredNumeral referenceLine={0} value={12} />,
    );
    it('renders properly when empty', () => {
        expect(wrapper.length).toEqual(1);
    });
});

describe('ColoredNumeral', () => {
    const wrapper = shallow(
        <ColoredNumeral referenceLine={0} value={-12} />,
    );
    it('renders properly when empty', () => {
        expect(wrapper.length).toEqual(1);
    });
});
describe('Numeral', () => {
    const wrapper = shallow(
        <Numeral />,
    );
    it('renders properly when empty', () => {
        expect(wrapper.length).toEqual(1);
    });
});

describe('Numeral', () => {
    const wrapper = shallow(
        <Numeral />,
    );
    it('renders properly when empty', () => {
        expect(wrapper.length).toEqual(1);
    });
});


describe('Numeral', () => {
    const wrapper = shallow(
        <Numeral
            value={39012839218031}
            normal
            precision={3}
            showSeparator
            showSign
            prefix="("
            suffix=")"
        />,
    );
    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});


describe('Numeral', () => {
    const wrapper = shallow(
        <Numeral
            value={-390128}
            showSign
            normal
            precision={3}
            showSeparator
            prefix="("
            suffix=")"
        />,
    );
    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});
