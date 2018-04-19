/*
 * ElementGroupApi
 *
 * Instance of this is passed with FaramContext
 * and is used by context provider to control all
 * input children.
 */

export default class ElementGroupApi {
    constructor(props) {
        this.setProps(props);
    }

    setProps = (props) => {
        this.props = props;
    }

    getValue = faramElementName => this.props.value[faramElementName];

    getError = faramElementName => this.props.error[faramElementName];

    getInternalError = () => this.props.error.$internal;

    isDisabled = () => this.props.disabled;

    // FIXME: Optimize
    // Memoize function
    getOnChange = faramElementName => (value, error) => {
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

        this.props.onChange(newValue, newError);
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
