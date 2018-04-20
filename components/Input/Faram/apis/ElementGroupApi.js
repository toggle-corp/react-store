/*
 * ElementGroupApi
 *
 * Instance of this is passed with FaramContext
 * and is used by context provider to control all
 * input children.
 */

export default class ElementGroupApi {
    changeHandlers = {};

    setProps = (props) => {
        this.props = { ...props };
    }

    getValue = faramElementName => (this.props.value || {})[faramElementName];

    getError = faramElementName => (this.props.error || {})[faramElementName];

    getInternalError = () => (this.props.error || {}).$internal;

    isDisabled = () => this.props.disabled;

    createOnChange = faramElementName => (value, error) => {
        if (!this.props.onChange) {
            return;
        }

        const newValue = {
            ...this.props.value,
            [faramElementName]: value,
        };

        const newError = {
            ...this.props.error,
            $internal: undefined,
            [faramElementName]: error,
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

    getCalculatedProps = (faramElementName, elementType) => {
        switch (elementType) {
            case 'input': {
                const calculatedProps = {
                    value: this.getValue(faramElementName),
                    error: this.getError(faramElementName),
                    onChange: this.getOnChange(faramElementName),
                    disabled: this.isDisabled(),
                };
                return calculatedProps;
            } case 'errorMessage': {
                const calculatedProps = {
                    errors: this.getInternalError(),
                };
                return calculatedProps;
            } default:
                console.warn(`Unidentified element type '${elementType}'`);
                return {};
        }
    }
}
