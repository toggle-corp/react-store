import FormElementApi from '../Form/FormElementApi';

import { analyzeErrors } from '../Faram/validator';

export default class FaramGroupApi extends FormElementApi {
    changeHandlers = {};
    propsCalculators = {};

    setProps = (props) => {
        this.props = {
            ...props,
            onChange: (value, info) => {
                // NOTE: Save these values in this.props so that above
                // destructuring keeps working before setProps is
                // again called.
                this.value = value;

                props.onChange(value, info);
            },
        };
    }

    getValue = faramIdentifier => (
        this.props.value ? this.props.value[faramIdentifier] : undefined
    )

    getError = faramIdentifier => (
        this.props.error ? this.props.error[faramIdentifier] : undefined
    )

    getInternalError = () => (
        this.props.error ? this.props.error.$internal : undefined
    )

    getChangeDelay = () => this.props.changeDelay;

    isDisabled = () => this.props.disabled;

    getNewValue = (oldValue, key, val) => ({
        ...oldValue,
        [key]: val,
    })

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

    createOnChange = (faramIdentifier, faramInfo) => (value, info) => {
        if (!this.props.onChange) {
            return;
        }

        const newValue = this.getNewValue(this.props.value, faramIdentifier, value);
        const newInfo = this.getNewInfo(faramIdentifier, value, info, faramInfo);

        this.props.onChange(newValue, newInfo);
    }

    getOnChange = (faramIdentifier, faramInfo) => {
        if (this.changeHandlers[faramIdentifier]) {
            return this.changeHandlers[faramIdentifier];
        }

        const handler = this.createOnChange(faramIdentifier, faramInfo);
        this.changeHandlers[faramIdentifier] = handler;
        return handler;
    }

    // HANDLERS

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
