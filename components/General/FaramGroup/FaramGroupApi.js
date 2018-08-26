import FormElementApi from '../Form/FormElementApi';

import { analyzeErrors } from '../Faram/validator';

export default class FaramGroupApi extends FormElementApi {
    onChangeMemory = {};

    constructor() {
        super();
        this.handlers = this.getHandler();
    }

    getHandler() {
        return {
            ...super.getHandler(),
            input: {
                getPropsFromApi: ({ faramElementName, faramInfo, ...otherProps }) => ({
                    apiProps: faramElementName
                        ? { faramElementName, faramInfo }
                        : undefined,
                    otherProps,
                }),
                calculateElementProps: ({ faramElementName, faramInfo }) => ({
                    value: this.getValue(faramElementName),
                    error: this.getError(faramElementName),
                    onChange: this.getOnChange(faramElementName, faramInfo),
                    disabled: this.isDisabled(),
                    readOnly: this.isReadOnly(),
                    changeDelay: this.getChangeDelay(),
                }),
            },
            output: {
                getPropsFromApi: ({ faramElementName, ...otherProps }) => ({
                    apiProps: faramElementName
                        ? { faramElementName }
                        : undefined,
                    otherProps,
                }),
                calculateElementProps: ({ faramElementName }) => ({
                    value: this.getValue(faramElementName),
                }),
            },
            errorMessage: {
                getPropsFromApi: ({ faramElement, ...otherProps }) => ({
                    apiProps: faramElement
                        ? {}
                        : undefined,
                    otherProps,
                }),
                calculateElementProps: () => ({
                    errors: this.getInternalError(),
                }),
            },
            errorIndicator: {
                getPropsFromApi: ({ faramElementName, ...otherProps }) => ({
                    apiProps: faramElementName
                        ? { faramElementName }
                        : undefined,
                    otherProps,
                }),
                calculateElementProps: ({ faramElementName }) => {
                    const errors = this.getError(faramElementName);
                    const calculatedProps = {
                        hasError: analyzeErrors(errors),
                        errors,
                    };
                    return calculatedProps;
                },
            },
        };
    }

    // overrides FormElementApi
    setProps = (props) => {
        this.props = {
            ...props,
            onChange: (value, info) => {
                // NOTE: Save these values in this.props so that above
                // destructuring keeps working before setProps is
                // again called.
                this.props.value = value;

                props.onChange(value, info);
            },
        };
    }

    getValue = faramElementName => (
        this.props.value ? this.props.value[faramElementName] : undefined
    )

    getError = faramElementName => (
        this.props.error ? this.props.error[faramElementName] : undefined
    )

    getInternalError = () => (
        this.props.error ? this.props.error.$internal : undefined
    )

    getChangeDelay = () => this.props.changeDelay;

    isReadOnly = () => this.props.isReadOnly;

    isDisabled = () => this.props.disabled;

    // helper for getOnChange
    getNewValue = (key, oldValue, newValue) => ({
        ...oldValue,
        [key]: newValue,
    })

    // helper for getOnChange
    getNewInfo = (key, value, info, infoFromProps) => {
        const faramElementName = (info && info.faramElementName) || [];
        const firstRun = faramElementName.length === 0;

        if (firstRun) {
            return {
                ...(info || infoFromProps),
                faramElementName: [key],
                faramElementValue: value,
            };
        }
        return {
            ...info,
            faramElementName: [key, ...info.faramElementName],
        };
    }

    // NOTE: memoized
    // NOTE: faramInfo shouldn't change
    getOnChange = (faramElementName, faramInfo) => {
        if (this.onChangeMemory[faramElementName]) {
            return this.onChangeMemory[faramElementName];
        }

        const newOnChange = (value, info) => {
            if (!this.props.onChange) {
                return;
            }

            const newValue = this.getNewValue(faramElementName, this.props.value, value);
            const newInfo = this.getNewInfo(faramElementName, value, info, faramInfo);
            this.props.onChange(newValue, newInfo);
        };
        this.onChangeMemory[faramElementName] = newOnChange;
        return newOnChange;
    }
}
