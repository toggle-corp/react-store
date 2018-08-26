/**
 * @author tnagorra <weathermist@gmail.com>
 */
import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';

import {
    accumulateValues,
    accumulateErrors,
    accumulateDifferentialErrors,
    analyzeErrors,
} from './validator';
import computeOutputs from './computer';
import FaramGroup from '../FaramGroup';
import styles from './styles.scss';

const noOp = () => {};

const propTypes = {
    /* class name for styling */
    className: PropTypes.string,
    /* children of the form */
    children: PropTypes.node.isRequired, // eslint-disable-line

    /* schema for validation */
    schema: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    /* schema for calculation */
    computeSchema: PropTypes.objectOf(PropTypes.any),
    /* fn to be called when value of any element change */
    onChange: PropTypes.func,
    /* fn to be called when form validation fails */
    onValidationFailure: PropTypes.func,
    /* fn to be called when form validation succeds */
    onValidationSuccess: PropTypes.func,

    /* object with values */
    value: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    /* Error for every field of form */
    error: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    /* Disable all elements in form */
    disabled: PropTypes.bool,
    /* Set elements to readonly in form */
    readOnly: PropTypes.bool,
    /* Delay every input component in form */
    changeDelay: PropTypes.number,

    /* Submit method setter to use externally */
    setSubmitFunction: PropTypes.func,
};

const defaultProps = {
    className: '',
    onChange: noOp,
    onValidationFailure: noOp,
    onValidationSuccess: noOp,
    disabled: false,
    readOnly: false,
    changeDelay: 100, // ms
    computeSchema: {},
    value: {},
    error: {},
    setSubmitFunction: undefined,
};

// TODO: memoizing accumulateErrors, analyzeErrors, accumulateValues
// should be done later
const handleSubmit = (value, schema, onValidationFailure, onValidationSuccess) => {
    const errors = accumulateErrors(value, schema);
    const hasErrors = analyzeErrors(errors);

    if (hasErrors) {
        onValidationFailure(errors);
        return value;
    }

    const values = accumulateValues(
        value,
        schema,
        { noFalsyValues: true },
    );

    const valuesWithNull = accumulateValues(
        value,
        schema,
        {
            noFalsyValues: false,
            falsyValue: null,
        },
    );
    onValidationSuccess(valuesWithNull, values);
    return values;
};

const memoizedComputeOutputs = memoize(computeOutputs);

const handleChange = ({
    value,
    info,
    onChange,
    computeSchema,
    schema,
    oldValue,
    oldError,
}) => {
    const newValue = memoizedComputeOutputs(value, computeSchema);

    if (oldValue === newValue) {
        return;
    }

    const newError = accumulateDifferentialErrors(
        oldValue,
        newValue,
        oldError,
        schema,
    );

    onChange(newValue, newError, info);
};


/*
 * Form Component for field validations and values aggregation
 */
export default class Faram extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    componentWillMount() {
        const { setSubmitFunction } = this.props;
        if (setSubmitFunction) {
            setSubmitFunction(this.submit);
        }

        const {
            onChange,
            computeSchema,
            schema,
            value,
            error,
        } = this.props;

        handleChange({
            value,
            info: { computed: true },
            onChange,
            computeSchema,
            schema,
            oldValue: value,
            oldError: error,
        });
    }

    componentWillReceiveProps(nextProps) {
        const {
            value: newValue,
            computeSchema: newComputeSchema,
            schema: newSchema,
            onChange,
        } = nextProps;
        const {
            value: oldValue,
            error: oldError,
        } = this.props;

        handleChange({
            value: newValue,
            info: { computed: true },
            onChange,
            computeSchema: newComputeSchema,
            schema: newSchema,
            oldValue,
            oldError,
        });
    }

    componentWillUnmount() {
        clearTimeout(this.changeTimeout);
        const { setSubmitFunction } = this.props;
        if (setSubmitFunction) {
            setSubmitFunction(undefined);
        }
    }

    // NOTE:
    // Submit method that can be called externally
    // Use detachedFaram instead of calling submit externally
    submit = () => {
        clearTimeout(this.changeTimeout);

        const {
            disabled,
            changeDelay,
        } = this.props;

        if (disabled) {
            return;
        }

        // Add some delay to submit
        this.changeTimeout = setTimeout(
            () => {
                const {
                    value,
                    schema,
                    onValidationFailure,
                    onValidationSuccess,
                } = this.props;
                handleSubmit(
                    value,
                    schema,
                    onValidationFailure,
                    onValidationSuccess,
                );
            },
            changeDelay,
        );
    }

    handleSubmitClick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        this.submit();

        // NOTE: Returning false will not submit & redirect
        return false;
    }

    handleFormChange = (value, info) => {
        const {
            onChange,
            computeSchema,
            schema,
            value: oldValue,
            error: oldError,
        } = this.props;

        handleChange({
            value,
            info,
            onChange,
            computeSchema,
            schema,
            oldValue,
            oldError,
        });
    }

    render() {
        const {
            children,
            className,
            value,
            error,
            disabled,
            readOnly,
            changeDelay,
        } = this.props;

        return (
            <form
                className={`${className} ${styles.form}`}
                onSubmit={this.handleSubmitClick}
                noValidate
            >
                <FaramGroup
                    onChange={this.handleFormChange}
                    value={value}
                    error={error}
                    disabled={disabled}
                    readOnly={readOnly}
                    changeDelay={changeDelay}
                >
                    {children}
                </FaramGroup>
            </form>
        );
    }
}

export const detachedFaram = ({
    value,
    schema,
    // computeSchema,
    // onChange,
    onValidationFailure,
    onValidationSuccess,
}) => {
    // NOTE: Faram may not be mounted so we need to trigger computation here
    // handleValueChange(value, schema, computeSchema, onChange);

    handleSubmit(value, schema, onValidationFailure, onValidationSuccess);
};

export * from './validations';
