import { analyzeErrors } from '../validator';


export default class ElementApi {
    changeHandlers = {};
    propsCalculators = {};

    setProps = (props) => {
        this.props = { ...props };
    }

    getValue = faramIdentifier => (this.props.value || {})[faramIdentifier];

    getError = faramIdentifier => (this.props.error || {})[faramIdentifier];

    getInternalError = () => (this.props.error || {}).$internal;

    isDisabled = () => this.props.disabled;

    getChangeDelay = () => this.props.changeDelay;

    // PRIVATE
    getNewValue = (oldValue, key, val) => ({
        ...oldValue,
        [key]: val,
    })

    // PRIVATE
    getNewError = (oldError, key, err) => ({
        ...oldError,
        $internal: undefined,
        [key]: err,
    });

    // PRIVATE
    createOnChange = faramIdentifier => (value, error) => {
        if (!this.props.onChange) {
            return;
        }

        const newValue = this.getNewValue(this.props.value, faramIdentifier, value);
        const newError = this.getNewError(this.props.error, faramIdentifier, error);

        // NOTE: Save these values in this.props so that above
        // destructuring keeps working before setProps is
        // again called.
        this.props.value = newValue;
        this.props.error = newError;
        this.props.onChange(newValue, newError);
    }

    // PRIVATE
    getOnChange = (faramIdentifier) => {
        if (this.changeHandlers[faramIdentifier]) {
            return this.changeHandlers[faramIdentifier];
        }

        const handler = this.createOnChange(faramIdentifier);
        this.changeHandlers[faramIdentifier] = handler;
        return handler;
    }

    // PUBLIC
    getCalculatedProps = (faramIdentifier, elementType, action) => {
        // For faramElement of type 'type', a typeHandler will be applicable
        const handler = this[`${elementType}Handler`];
        if (handler) {
            const values = handler(faramIdentifier, elementType, action);
            return values;
        }
        console.error(`I do not have handler for ${elementType}`);
        return undefined;
    }

    // Handlers

    inputHandler = (faramIdentifier) => {
        const calculatedProps = {
            value: this.getValue(faramIdentifier),
            error: this.getError(faramIdentifier),
            onChange: this.getOnChange(faramIdentifier),
            disabled: this.isDisabled(),
            changeDelay: this.getChangeDelay(),
        };
        return calculatedProps;
    }

    outputHandler = (faramIdentifier) => {
        const calculatedProps = {
            value: this.getValue(faramIdentifier),
        };
        return calculatedProps;
    }

    errorIndicatorHandler = (faramIdentifier) => {
        const calculatedProps = {
            hasError: analyzeErrors(this.getError(faramIdentifier)),
        };
        return calculatedProps;
    }

    errorMessageHandler = () => {
        const calculatedProps = {
            errors: this.getInternalError(),
        };
        return calculatedProps;
    }
}

