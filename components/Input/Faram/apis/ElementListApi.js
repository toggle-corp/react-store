import { isTruthy } from '../../../../utils/common';

/*
 * ElementListApi
 *
 * Instance of this is passed with FaramContext
 * and is used by context provider to control all
 * input children.
 */

export default class ElementListApi {
    changeHandlers = {};

    setProps = (props) => {
        this.props = { ...props };
    }

    getValue = faramElementIndex => (this.props.value || [])[faramElementIndex];

    getError = faramElementIndex => (this.props.error || {})[faramElementIndex];

    getInternalError = () => (this.props.error || {}).$internal;

    isDisabled = () => this.props.disabled;

    createOnChange = faramElementIndex => (value, error) => {
        if (!this.props.onChange) {
            return;
        }

        const newValue = [...this.props.value];
        newValue[faramElementIndex] = value;

        const newError = {
            ...this.props.error,
            $internal: undefined,
            [faramElementIndex]: error,
        };

        // NOTE: Save these values in this.props so that above
        // destructuring keeps working before setProps is
        // again called.
        this.props.value = newValue;
        this.props.error = newError;
        this.props.onChange(newValue, newError);
    }

    getOnChange = (faramElementName) => {
        if (this.changeHandlers[faramElementName]) {
            return this.changeHandlers[faramElementName];
        }

        const handler = this.createOnChange(faramElementName);
        this.changeHandlers[faramElementName] = handler;
        return handler;
    }

    getOnClick = (action, faramElementIndex) => {
        switch (action) {
            case 'add':
                return this.add;
            case 'remove':
                return () => this.remove(faramElementIndex);
            default:
                return this.noOp;
        }
    }

    noOp = () => {};

    add = () => {
        const newValue = [...this.props.value, undefined];
        const newError = {
            ...this.props.error,
            $internal: undefined,
        };

        this.props.onChange(newValue, newError);
    }

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

    getCalculatedProps = (faramElementIndex, elementType, action) => {
        switch (elementType) {
            case 'input': {
                const calculatedProps = {
                    value: this.getValue(faramElementIndex),
                    error: this.getError(faramElementIndex),
                    onChange: this.getOnChange(faramElementIndex),
                    disabled: this.isDisabled(),
                };
                return calculatedProps;
            } case 'output': {
                const calculatedProps = {
                    value: this.getValue(faramElementIndex),
                };
                return calculatedProps;
            } case 'errorMessage': {
                const calculatedProps = {
                    errors: this.getInternalError(),
                };
                return calculatedProps;
            } case 'action': {
                const calculatedProps = {
                    disabled: this.isDisabled(),
                    onClick: this.getOnClick(action, faramElementIndex),
                };
                return calculatedProps;
            } case 'list': {
                const calculatedProps = {
                    data: this.props.value,
                };
                return calculatedProps;
            }
            default:
                console.warn(`Unidentified element type '${elementType}'`);
                return {};
        }
    }
}
