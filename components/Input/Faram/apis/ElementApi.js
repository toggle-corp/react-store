import { analyzeErrors } from '../validator';


export default class ElementApi {
    changeHandlers = {};
    propsCalculators = {};

    setProps = (props) => {
        this.props = { ...props };
    }

    getValue = faramElementName => (this.props.value || {})[faramElementName];

    getError = faramElementName => (this.props.error || {})[faramElementName];

    getInternalError = () => (this.props.error || {}).$internal;

    isDisabled = () => this.props.disabled;

    // PRIVATE
    getNewValue = (oldValue, key, val) => ({
        ...oldValue,
        [key]: val,
    })

    getNewError = (oldError, key, err) => ({
        ...oldError,
        $internal: undefined,
        [key]: err,
    });

    // PRIVATE
    createOnChange = faramElementName => (value, error) => {
        if (!this.props.onChange) {
            return;
        }

        const newValue = this.getNewValue(this.props.value, faramElementName, value);
        const newError = this.getNewError(this.props.error, faramElementName, error);

        // NOTE: Save these values in this.props so that above
        // destructuring keeps working before setProps is
        // again called.
        this.props.value = newValue;
        this.props.error = newError;
        this.props.onChange(newValue, newError);
    }

    // PRIVATE
    getOnChange = (faramElementName) => {
        if (this.changeHandlers[faramElementName]) {
            return this.changeHandlers[faramElementName];
        }

        const handler = this.createOnChange(faramElementName);
        this.changeHandlers[faramElementName] = handler;
        return handler;
    }

    getCalculatedProps = (faramElementName, elementType, action) => {
        const calculator = this[`${elementType}Handler`];
        if (calculator) {
            const values = calculator(faramElementName, elementType, action);
            return values;
        }
        console.error(`I do not have handler for ${elementType}`);
        return undefined;
    }

    // Handlers

    inputHandler = (faramElementName) => {
        const calculatedProps = {
            value: this.getValue(faramElementName),
            error: this.getError(faramElementName),
            onChange: this.getOnChange(faramElementName),
            disabled: this.isDisabled(),
        };
        return calculatedProps;
    }

    outputHandler = (faramElementName) => {
        const calculatedProps = {
            value: this.getValue(faramElementName),
        };
        return calculatedProps;
    }

    errorMessageHandler = () => {
        const calculatedProps = {
            errors: this.getInternalError(),
        };
        return calculatedProps;
    }

    errorIndicatorHandler = (faramElementName) => {
        const calculatedProps = {
            hasError: analyzeErrors(this.getError(faramElementName)),
        };
        return calculatedProps;
    }
}

