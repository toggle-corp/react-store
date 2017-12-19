import React from 'react';
import { shallow, mount } from 'enzyme';
import Button, {
    PrimaryButton,
    AccentButton,
    SuccessButton,
    DangerButton,
    WarningButton,
    TransparentButton,
    TransparentPrimaryButton,
    TransparentAccentButton,
    TransparentSuccessButton,
    TransparentDangerButton,
    TransparentWarningButton,
} from '../index';


describe('Button', () => {
    const testObject = {};
    const onClick = () => { testObject.clicked = true; };
    const wrapper = mount(
        <Button
            disabled={false}
            onClick={onClick}
        >
            Button
        </Button>,
    );

    it('checks if clicked properly', () => {
        // console.log(wrapper.props());
        wrapper.setProps({
            disabled: true,
        });
        wrapper.find('button').simulate('click');
        expect(testObject.clicked).toBeFalsy();
        wrapper.setProps({
            disabled: false,
        });
        wrapper.find('button').simulate('click');
        expect(testObject.clicked).toBeTruthy();
        // console.log(wrapper.props());
    });
});


describe('Button', () => {
    const wrapper = shallow(
        <Button
            title="Test"
            className="test"
            iconName="test"
        >
            Button
        </Button>,
    );
    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});

describe('PrimaryButton', () => {
    const wrapper = shallow(
        <PrimaryButton
            title="Test"
            className="test"
            iconName="test"
        >
            PrimaryButton
        </PrimaryButton>,
    );
    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});

describe('AccentButton', () => {
    const wrapper = shallow(
        <AccentButton
            title="Test"
            className="test"
            iconName="test"
        >
            AccentButton
        </AccentButton>,
    );
    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});

describe('SuccessButton', () => {
    const wrapper = shallow(
        <SuccessButton
            title="Test"
            className="test"
            iconName="test"
        >
            SuccessButton
        </SuccessButton>,
    );
    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});

describe('DangerButton', () => {
    const wrapper = shallow(
        <DangerButton
            title="Test"
            className="test"
            iconName="test"
        >
            DangerButton
        </DangerButton>,
    );
    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});

describe('WarningButton', () => {
    const wrapper = shallow(
        <WarningButton
            title="Test"
            className="test"
            iconName="test"
        >
            WarningButton
        </WarningButton>,
    );
    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});

describe('TransparentButton', () => {
    const wrapper = shallow(
        <TransparentButton
            title="Test"
            className="test"
            iconName="test"
        >
            TransparentButton
        </TransparentButton>,
    );
    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});

describe('TransparentPrimaryButton', () => {
    const wrapper = shallow(
        <TransparentPrimaryButton
            title="Test"
            className="test"
            iconName="test"
        >
            TransparentPrimaryButton
        </TransparentPrimaryButton>,
    );
    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});

describe('TransparentAccentButton', () => {
    const wrapper = shallow(
        <TransparentAccentButton
            title="Test"
            className="test"
            iconName="test"
        >
            TransparentAccentButton
        </TransparentAccentButton>,
    );
    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});

describe('TransparentSuccessButton', () => {
    const wrapper = shallow(
        <TransparentSuccessButton
            title="Test"
            className="test"
            iconName="test"
        >
            TransparentSuccessButton
        </TransparentSuccessButton>,
    );
    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});

describe('TransparentDangerButton', () => {
    const wrapper = shallow(
        <TransparentDangerButton
            title="Test"
            className="test"
            iconName="test"
        >
            TransparentDangerButton
        </TransparentDangerButton>,
    );
    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});

describe('TransparentWarningButton', () => {
    const wrapper = shallow(
        <TransparentWarningButton
            title="Test"
            className="test"
            iconName="test"
        >
            TransparentWarningButton
        </TransparentWarningButton>,
    );
    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});
