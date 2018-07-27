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
    getValue = faramIdentifier => (this.props.value || [])[faramIdentifier];

    // PRIVATE
    getNewValue = (oldValue, key, val) => {
        const newValue = [...oldValue];
        newValue[key] = val;
        return newValue;
    }

    // PRIVATE
    noOp = () => {};

    // PRIVATE
    add = (faramInfo = {}) => {
        let { newElement } = faramInfo;
        if (newElement && typeof newElement === 'function') {
            newElement = newElement(this.props.value);
        }
        const newValue = [...this.props.value, newElement];
        const newError = {
            ...this.props.error,
            $internal: undefined,
        };

        // NOTE: Save these values in this.props so that above
        // destructuring keeps working before setProps is
        // again called.
        this.props.value = newValue;
        this.props.error = newError;

        this.props.onChange(newValue, newError);

        const { callback } = faramInfo;
        if (callback) {
            callback(newElement, newValue);
        }
    }

    // PRIVATE
    remove = (index, faramInfo = {}) => {
        const newValue = [...this.props.value];
        newValue.splice(index, 1);

        const newError = { ...this.props.error };

        delete newError.$internal;

        for (let i = index; i < this.props.value.length; i += 1) {
            delete newError[i];
            if (isTruthy(newError[i + 1])) {
                newError[i] = newError[i + 1];
            }
        }

        // NOTE: Save these values in this.props so that above
        // destructuring keeps working before setProps is
        // again called.
        this.props.value = newValue;
        this.props.error = newError;

        this.props.onChange(newValue, newError);

        const { callback } = faramInfo;
        if (callback) {
            callback(index, newValue);
        }
    }

    // PRIVATE
    change = (value) => {
        const newValue = value;
        const newError = {};

        // NOTE: Save these values in this.props so that above
        // destructuring keeps working before setProps is
        // again called.
        this.props.value = newValue;
        this.props.error = newError;

        // NOTE:
        // return new sorted value
        // clear error for all children
        // return faramInfo as is
        this.props.onChange(newValue, newError, this.props.info);
    }

    // PRIVATE
    getOnClick = ({ faramIdentifier, faramAction, faramInfo }) => {
        switch (faramAction) {
            case 'add':
                return () => this.add(faramInfo);
            case 'remove':
                return () => this.remove(faramIdentifier, faramInfo);
            default:
                return this.noOp;
        }
    }

    // Handlers

    actionHandler = ({ faramIdentifier, faramAction, faramInfo }) => {
        const calculatedProps = {
            disabled: this.isDisabled(),
            onClick: this.getOnClick({ faramIdentifier, faramAction, faramInfo }),
            changeDelay: this.getChangeDelay(),
        };
        return calculatedProps;
    }

    listHandler = () => {
        const calculatedProps = {
            data: this.props.value,
        };
        return calculatedProps;
    }

    sortableListHandler = () => {
        const calculatedProps = {
            data: this.props.value,
            onChange: this.change,
        };
        return calculatedProps;
    }
}
