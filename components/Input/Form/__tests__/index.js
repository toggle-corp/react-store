import React from 'react';
import { shallow } from 'enzyme';
import { requiredCondition } from '../validations';
import Form from '../index';
import TextInput from '../../TextInput';

describe('Form', () => {
    const wrapper = shallow(
        <Form
            elements={['id']}
            validations={{}}
            validation={{}}
        >
            <div />
        </Form>,
    );

    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});

describe('Form', () => {
    const wrapper = shallow(
        <Form
            elements={['id']}
            validations={{ id: [requiredCondition] }}
            validation={{}}
            changeCallback={() => {}}
            failureCallback={() => {}}
            successCallback={() => {}}
        >
            <div>
                <TextInput
                    formname="id"
                />
                <button />
            </div>
        </Form>,
    );

    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});
