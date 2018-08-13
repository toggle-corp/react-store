import { analyzeErrors } from '../validator';


export default class ElementApi {
    changeHandlers = {};
    propsCalculators = {};

    setProps = (props) => {
        this.props = { ...props };
    }

    getValue = (faramIdentifier, foldInfo) => {
        const value = (this.props.value || {})[faramIdentifier];
        if (!foldInfo.key || !foldInfo.unfold) {
            return value;
        }

        const foldKey = foldInfo.key;
        const foldValue = (this.props.value || {})[foldKey];
        return value.map(v => foldInfo.unfold(v, foldValue, foldKey));
    }

    getError = faramIdentifier => (this.props.error || {})[faramIdentifier];

    getInternalError = () => (this.props.error || {}).$internal;

    isDisabled = () => this.props.disabled;

    getChangeDelay = () => this.props.changeDelay;

    // PRIVATE
    getNewValue = (oldValue, key, val, foldInfo) => {
        if (!foldInfo.key || !foldInfo.fold) {
            return {
                ...oldValue,
                [key]: val,
            };
        }

        const foldKey = foldInfo.key;
        const foldResult = foldInfo.fold(val, oldValue[foldKey], foldKey);
        return {
            ...oldValue,
            [key]: foldResult.newValue || val,
            [foldKey]: foldResult.foldValue,
        };
    }

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
    createOnChange = (faramIdentifier, faramInfo, foldInfo) => (value, error, info) => {
        if (!this.props.onChange) {
            return;
        }

        const newValue = this.getNewValue(this.props.value, faramIdentifier, value, foldInfo);
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
    getOnChange = (faramIdentifier, faramInfo, foldInfo) => {
        if (this.changeHandlers[faramIdentifier]) {
            return this.changeHandlers[faramIdentifier];
        }

        const handler = this.createOnChange(faramIdentifier, faramInfo, foldInfo);
        this.changeHandlers[faramIdentifier] = handler;
        return handler;
    }

    // PUBLIC
    getCalculatedProps = ({
        faramIdentifier,
        elementType,
        faramAction,
        faramInfo,
        foldInfo,
    }) => {
        // For faramElement of type 'type', a typeHandler will be applicable
        const handler = this[`${elementType}Handler`];
        if (handler) {
            const values = handler({
                faramIdentifier,
                elementType,
                faramAction,
                faramInfo,
                foldInfo,
            });
            return values;
        }
        console.error(`I do not have handler for ${elementType}`);
        return undefined;
    }

    // Handlers

    inputHandler = ({ faramIdentifier, faramInfo, foldInfo }) => {
        const calculatedProps = {
            value: this.getValue(faramIdentifier, foldInfo),
            error: this.getError(faramIdentifier),
            onChange: this.getOnChange(faramIdentifier, faramInfo, foldInfo),
            disabled: this.isDisabled(),
            changeDelay: this.getChangeDelay(),
        };
        return calculatedProps;
    }

    outputHandler = ({ faramIdentifier, foldInfo }) => {
        const calculatedProps = {
            value: this.getValue(faramIdentifier, foldInfo),
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

