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
};

const noOp = () => {};

const defaultProps = {
    className: '',
    onChange: noOp,
    onValidationFailure: noOp,
    onValidationSuccess: noOp,
    disabled: false,
    changeDelay: 100, // ms
    computeSchema: {},
    value: {},
    error: {},
};

/*
 * Form Component for field validations and values aggregation
 */
export default class Faram extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static checkAndUpdateOutputs = (props) => {
        const { onChange, computeSchema, value } = props;
        const newValue = computeOutputs(value, computeSchema);
        if (onChange && newValue !== value) {
            onChange(newValue);
        }
    }

    constructor(props) {
        super(props);
        Faram.checkAndUpdateOutputs(props);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.computeSchema !== this.props.computeSchema) {
            Faram.checkAndUpdateOutputs(nextProps);
        }
    }

    componentWillUnmount() {
        clearTimeout(this.changeTimeout);
    }

    handleSubmit = () => {
        const errors = accumulateErrors(this.props.value, this.props.schema);
        const hasErrors = analyzeErrors(errors);

        if (hasErrors) {
            this.props.onValidationFailure(errors);
        } else {
            const values = accumulateValues(
                this.props.value,
                this.props.schema,
                { noUndefined: true },
            );
            this.props.onValidationSuccess(values);
        }
    }

    // Submit using ref
    submit = () => {
        if (this.props.disabled) {
            return;
        }

        // Add some delay in submission as well
        clearTimeout(this.changeTimeout);
        this.changeTimeout = setTimeout(
            this.handleSubmit,
            this.props.changeDelay,
        );
    }

    // Submit using submit button

    handleSubmitClick = (e) => {
        e.preventDefault();
        this.submit();

        // NOTE: Returning false will not submit the form & redirect
        return false;
    }

    handleFormChange = (value, error) => {
        const { onChange, computeSchema } = this.props;
        if (onChange) {
            const newValue = computeOutputs(value, computeSchema);
            onChange(newValue, error);
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
