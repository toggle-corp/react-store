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
    getNewInfo = (key, val, infoFromInput, infoFromProps) => {
        const faramElementName = (infoFromInput && infoFromInput.faramElementName) || [];
        const firstRun = faramElementName.length === 0;

        if (firstRun) {
            return {
                ...(infoFromInput || infoFromProps),
                faramElementName: [key],
                faramElementValue: val,
            };
        }
        return {
            ...infoFromInput,
            faramElementName: [key, ...infoFromInput.faramElementName],
        };
    }

    // PRIVATE
    createOnChange = (faramIdentifier, faramInfo) => (value, error, info) => {
        if (!this.props.onChange) {
            return;
        }

        const newValue = this.getNewValue(this.props.value, faramIdentifier, value);
        const newError = this.getNewError(this.props.error, faramIdentifier, error);
        const newInfo = this.getNewInfo(faramIdentifier, value, info, faramInfo);

        // NOTE: Save these values in this.props so that above
        // destructuring keeps working before setProps is
        // again called.
        this.props.value = newValue;
        this.props.error = newError;
        this.props.onChange(newValue, newError, newInfo);
    }

    // PRIVATE
    getOnChange = (faramIdentifier, faramInfo) => {
        if (this.changeHandlers[faramIdentifier]) {
            return this.changeHandlers[faramIdentifier];
        }

        const handler = this.createOnChange(faramIdentifier, faramInfo);
        this.changeHandlers[faramIdentifier] = handler;
        return handler;
    }

    // PUBLIC
    getCalculatedProps = ({ faramIdentifier, elementType, faramAction, faramInfo }) => {
        // For faramElement of type 'type', a typeHandler will be applicable
        const handler = this[`${elementType}Handler`];
        if (handler) {
            const values = handler({ faramIdentifier, elementType, faramAction, faramInfo });
            return values;
        }
        console.error(`I do not have handler for ${elementType}`);
        return undefined;
    }

    // Handlers

    inputHandler = ({ faramIdentifier, faramInfo }) => {
        const calculatedProps = {
            value: this.getValue(faramIdentifier),
            error: this.getError(faramIdentifier),
            onChange: this.getOnChange(faramIdentifier, faramInfo),
            disabled: this.isDisabled(),
            changeDelay: this.getChangeDelay(),
        };
        return calculatedProps;
    }

    outputHandler = ({ faramIdentifier }) => {
        const calculatedProps = {
            value: this.getValue(faramIdentifier),
        };
        return calculatedProps;
    }

    errorMessageHandler = () => {
        const calculatedProps = {
            errors: this.getInternalError(),
        };
        return calculatedProps;
    }

    // NOTE: different from 'errorMessage'
    // sends the overall error tree instead of $internal
    errorIndicatorHandler = ({ faramIdentifier }) => {
        const errors = this.getError(faramIdentifier);
        const calculatedProps = {
            hasError: analyzeErrors(errors),
            errors,
        };
        return calculatedProps;
    }
}

