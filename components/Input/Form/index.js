/**
 * @author tnagorra <weathermist@gmail.com>
 */
import PropTypes from 'prop-types';
import React from 'react';

import { isTruthy } from '../../../utils/common';

import FormHelper from './FormHelper';
import injectRecursively, { ACTION } from './injection';
import styles from './styles.scss';

const propTypes = {
    /* children of the form */
    children: PropTypes.node.isRequired, // eslint-disable-line
    /* fn to be called when value of any element change */
    changeCallback: PropTypes.func,
    /* fn to be called when form validation fails */
    failureCallback: PropTypes.func,
    /* fn to be called when form validation succeds */
    successCallback: PropTypes.func,
    /* class name for styling */
    className: PropTypes.string,
    /* schema for validation */
    schema: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    /* object with values */
    value: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    /* Error for a part of form */
    formErrors: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    /* Error for every field of form */
    fieldErrors: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    /* Disable all elements in form */
    disabled: PropTypes.bool,
    /* Delay every input component in form */
    changeDelay: PropTypes.number,
};

const defaultProps = {
    className: '',
    changeCallback: () => { console.log('No change callback'); },
    failureCallback: () => { console.log('No failure callback'); },
    successCallback: () => { console.log('No success callback'); },
    disabled: false,
    changeDelay: 100, // ms
    schema: {},
    value: {},
    formErrors: {},
    fieldErrors: {},
};

/*
 * Form Component for field validations and values aggregation
 */
export default class Form extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const {
            changeCallback,
            failureCallback,
            successCallback,
            schema,
            value,
            formErrors,
            fieldErrors,
        } = this.props;

        const form = new FormHelper();
        form.setSchema(schema);
        form.setCallbacks(
            changeCallback,
            failureCallback,
            successCallback,
        );
        form.setValue(value);
        form.setFormErrors(formErrors);
        form.setFieldErrors(fieldErrors);
        this.form = form;

        this.injectionProperties = [
            // formskip
            {
                getAction: childProps => (
                    isTruthy(childProps.formskip)
                        ? ACTION.inject
                        : ACTION.skip
                ),
                getProperty: () => ({
                    formskip: undefined,
                }),
            },
            // formname with formpush
            {
                getAction: childProps => (
                    isTruthy(childProps.formname) && isTruthy(childProps.formpush)
                        ? ACTION.inject
                        : ACTION.skip
                ),
                getProperty: childProps => ({
                    onClick: this.form.getPushCallback(childProps.formname, childProps.formpush),
                    formname: undefined,
                    formpush: undefined,
                }),
            },
            // formname with formpop
            {
                getAction: childProps => (
                    isTruthy(childProps.formname) && isTruthy(childProps.formpop)
                        ? ACTION.inject
                        : ACTION.skip
                ),
                getProperty: childProps => ({
                    onClick: this.form.getPopCallback(childProps.formname),
                    formname: undefined,
                    formpop: undefined,
                }),
            },
            // formname
            {
                getAction: childProps => (
                    isTruthy(childProps.formname)
                        ? ACTION.inject
                        : ACTION.skip
                ),
                getProperty: childProps => ({
                    onChange: this.form.getChangeCallback(childProps.formname),
                    value: this.form.getValue(childProps.formname),
                    error: this.form.getFieldError(childProps.formname),
                    disabled: this.props.disabled,
                    changeDelay: this.props.changeDelay,
                    formname: undefined,
                }),
            },
            // formerror
            {
                getAction: childProps => (
                    isTruthy(childProps.formerror) ? ACTION.inject : ACTION.skip
                ),
                getProperty: childProps => ({
                    errors: this.form.getFormError(childProps.formerror),
                    formerror: undefined,
                }),
            },
        ];
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.value !== nextProps.value) {
            this.form.setValue(nextProps.value);
        }
        if (this.props.schema !== nextProps.schema) {
            this.form.setSchema(nextProps.schema);
        }
        if (this.props.formErrors !== nextProps.formErrors) {
            this.form.setFormErrors(nextProps.formErrors);
        }
        if (this.props.fieldErrors !== nextProps.fieldErrors) {
            this.form.setFieldErrors(nextProps.fieldErrors);
        }
    }

    componentWillUnmount() {
        clearTimeout(this.changeTimeout);
    }

    // Submit using ref

    submit = () => {
        // Add same delay in submission as well
        clearTimeout(this.changeTimeout);
        this.changeTimeout = setTimeout(
            () => { this.form.submit(); },
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
                { injectRecursively(children, this.injectionProperties) }
            </form>
        );
    }
}

export * from './validations';
