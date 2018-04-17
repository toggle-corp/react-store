/*
 * ElementGroupApi
 *
 * Instance of this is passed with InputContext
 * and is used by context provider to control all
 * input children.
 */

export default class ElementGroupApi {
    constructor(props) {
        this.setProps(props);
        // memoize onChange callbacks
        this.onChangeCallbacks = {};
    }

    // To update props later
    setProps = (props) => {
        this.props = props;
    }

    getValue = faramElementName => this.props.value[faramElementName];

    getError = faramElementName => this.props.errors[faramElementName];

    getInternalError = () => this.props.errors.$internal;

    isDisabled = () => this.props.disabled;

    getOnChange = (faramElementName) => {
        if (!this.onChangeCallbacks[faramElementName]) {
            const callback = (value) => {
                if (!this.props.onChange) {
                    return;
                }

                const newValue = {
                    ...this.props.value,
                    [faramElementName]: value,
                };
                const newErrors = {
                    ...this.props.errors,
                    $internal: undefined,
                    [faramElementName]: undefined,
                };
                this.props.onChange(newValue, newErrors);
            };
            this.onChangeCallbacks[faramElementName] = callback;
        }
        return this.onChangeCallbacks[faramElementName];
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
                // console.warn(faramElementName, calculatedProps);
                return calculatedProps;
            } case 'errorMessage': {
                const calculatedProps = {
                    errors: this.getInternalError(),
                };
                // console.warn(faramElementName, calculatedProps);
                return calculatedProps;
            } default:
                console.warn(`Unidentified element type '${elementType}'`);
                return {};
        }
    }
}
