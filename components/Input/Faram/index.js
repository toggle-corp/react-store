/**
 * @author tnagorra <weathermist@gmail.com>
 */
import PropTypes from 'prop-types';
import React from 'react';

import {
    accumulateValues,
    accumulateErrors,
    analyzeErrors,
} from './validator';
import computeOutputs from './computer';
import FaramGroup from './FaramGroup';
import styles from './styles.scss';

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
    /* Delay every input component in form */
    changeDelay: PropTypes.number,

    /* Submit method setter to use externally */
    setSubmitFunction: PropTypes.func,
};

const noOp = () => {};

const defaultProps = {
    className: '',
    onChange: noOp,
    onValidationFailure: noOp,
    onValidationSuccess: noOp,
    disabled: false,
    changeDelay: 200, // ms
    computeSchema: {},
    value: {},
    error: {},
    setSubmitFunction: undefined,
};

const checkAndUpdateOutputs = (value, error, computeSchema, onChange) => {
    const newValue = computeOutputs(value, computeSchema);
    if (onChange && newValue !== value) {
        onChange(newValue, error, { isComputed: true });
    }
    return newValue;
};

const handleSubmit = (value, schema, onValidationFailure, onValidationSuccess) => {
    const errors = accumulateErrors(value, schema);
    const hasErrors = analyzeErrors(errors);

    if (hasErrors) {
        onValidationFailure(errors);
    } else {
        const values = accumulateValues(
            value,
            schema,
            { noUndefined: true },
        );
        onValidationSuccess(values);
    }
};

export const detachedFaram = ({
    value,
    error,
    schema,
    computeSchema,
    onChange,
    onValidationFailure,
    onValidationSuccess,
}) => {
    // NOTE: doesn't use computed value as new Value
    // NOTE: Faram may not be mounted so we need to trigger computation here
    checkAndUpdateOutputs(value, error, computeSchema, onChange);

    handleSubmit(value, schema, onValidationFailure, onValidationSuccess);
};

/*
 * Form Component for field validations and values aggregation
 */
export default class Faram extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        const { value, error, computeSchema, onChange } = this.props;
        checkAndUpdateOutputs(value, error, computeSchema, onChange);

        if (props.setSubmitFunction) {
            props.setSubmitFunction(this.submit);
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.computeSchema !== this.props.computeSchema) {
            const { value, error, computeSchema, onChange } = nextProps;
            checkAndUpdateOutputs(value, error, computeSchema, onChange);
        }
    }

    componentWillUnmount() {
        clearTimeout(this.changeTimeout);
        if (this.props.setSubmitFunction) {
            this.props.setSubmitFunction(undefined);
        }
    }

    // Submit method to call externally
    submit = () => {
        if (this.props.disabled) {
            return;
        }

        clearTimeout(this.changeTimeout);

        // Add some delay in submission
        this.changeTimeout = setTimeout(
            () => {
                const { value, schema, onValidationFailure, onValidationSuccess } = this.props;
                handleSubmit(value, schema, onValidationFailure, onValidationSuccess);
            },
            this.props.changeDelay,
        );
    }

    // Submit using submit button

    handleSubmitClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.submit();

        // NOTE: Returning false will not submit the form & redirect
        return false;
    }

    handleFormChange = (value, error, info) => {
        const { onChange, computeSchema } = this.props;
        if (onChange) {
            const newValue = computeOutputs(value, computeSchema);
            onChange(newValue, error, { ...info, isComputed: false });
        }
    }

    render() {
        const {
            children,
            className,
        } = this.props;

        return (
            <form
                className={`${className} ${styles.form}`}
                onSubmit={this.handleSubmitClick}
                noValidate
            >
                <FaramGroup
                    onChange={this.handleFormChange}
                    value={this.props.value}
                    error={this.props.error}
                    disabled={this.props.disabled}
                    changeDelay={this.props.changeDelay}
                >
                    {children}
                </FaramGroup>
            </form>
        );
    }
}

export * from './validations';
