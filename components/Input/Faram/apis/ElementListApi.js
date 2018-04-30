import { isTruthy } from '../../../../utils/common';

import ElementApi from './ElementApi';

/*
 * ElementListApi
 *
 * Instance of this is passed with FaramContext
 * and is used by context provider to control all
 * input children.
 */

export default class ElementListApi extends ElementApi {
    getValue = faramElementIndex => (this.props.value || [])[faramElementIndex];

    // PRIVATE
    getNewValue = (oldValue, key, val) => {
        const newValue = [...oldValue];
        newValue[key] = val;
        return newValue;
    }

    // PRIVATE
    noOp = () => {};

    // PRIVATE
    add = () => {
        const newValue = [...this.props.value, undefined];
        const newError = {
            ...this.props.error,
            $internal: undefined,
        };

        this.props.onChange(newValue, newError);
    }

    // PRIVATE
    remove = (index) => {
        const newValue = [...this.props.value];
        newValue.splice(index, 1);

        const newError = {
            ...this.props.error,
            $internal: undefined,
        };

        delete newError[index];

        for (let i = index + 1; i < this.props.value.length; i += 1) {
            delete newError[i - 1];
            if (isTruthy(newError[i])) {
                newError[i - 1] = newError[i];
            }
        }

        this.props.onChange(newValue, newError);
    }

    // PRIVATE
    getOnClick = (faramElementIndex, elementType, action) => {
        switch (action) {
            case 'add':
                return this.add;
            case 'remove':
                return () => this.remove(faramElementIndex);
            default:
                return this.noOp;
        }
    }

    // Handlers

    actionHandler = (faramElementIndex, elementType, action) => {
        const calculatedProps = {
            disabled: this.isDisabled(),
            onClick: this.getOnClick(faramElementIndex, elementType, action),
        };
        return calculatedProps;
    }

    listHandler = () => {
        const calculatedProps = {
            data: this.props.value,
        };
        return calculatedProps;
    }
}
