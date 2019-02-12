import { isFalsy, isTruthy } from '@togglecorp/fujs';

import FormElementApi from '../Form/FormElementApi';
import { analyzeErrors } from '../Faram/validator';

const emptyObject = {};

export default class FaramGroupApi extends FormElementApi {
    onChangeMemory = {};
    onClickMemory = {}

    constructor() {
        super();
        this.handlers = this.getHandler();
    }

    getHandler() {
        return {
            ...super.getHandler(),
            input: {
                getPropsFromApi: ({ faramElementName, faramInfo, ...otherProps }) => ({
                    apiProps: !isFalsy(faramElementName, [''])
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
                    apiProps: !isFalsy(faramElementName, [''])
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
                    apiProps: isTruthy(faramElement)
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
                    apiProps: !isFalsy(faramElementName, [''])
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
            action: {
                getPropsFromApi: ({ faramElementName, faramAction, ...otherProps }) => ({
                    apiProps: !isFalsy(faramElementName, ['']) && faramAction
                        ? { faramElementName, faramAction }
                        : undefined,
                    otherProps,
                }),
                calculateElementProps: ({ faramElementName, faramAction }) => ({
                    disabled: this.isDisabled() || this.isReadOnly(),
                    changeDelay: this.getChangeDelay(),
                    onClick: this.getOnClick(faramElementName, faramAction),
                }),
            },
        };
    }

    // NOTE: This function is overridden by FaramListApi
    getEmptyElement = () => emptyObject;

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

    isReadOnly = () => this.props.readOnly;

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

            const newValue = this.getNewValue(
                faramElementName,
                this.props.value,
                value,
            );
            const newInfo = this.getNewInfo(
                faramElementName,
                value,
                info,
                faramInfo,
            );

            this.props.onChange(newValue, newInfo);
        };
        this.onChangeMemory[faramElementName] = newOnChange;
        return newOnChange;
    }

    // NOTE: memoized
    // NOTE: faramAction shouldn't change
    getOnClick = (faramElementName, faramAction) => {
        if (this.onClickMemory[faramElementName]) {
            return this.onClickMemory[faramElementName];
        }

        const newOnClick = (clickParams) => {
            const newValue = faramAction(
                this.props.value || this.getEmptyElement(),
                faramElementName,
                clickParams,
            );
            // Button doesn't have children, so no need to propagate faramInfo
            this.props.onChange(newValue);
        };
        this.onClickMemory[faramElementName] = newOnClick;
        return newOnClick;
    }
}
