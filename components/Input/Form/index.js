/**
 * @author tnagorra <weathermist@gmail.com>
 */
import PropTypes from 'prop-types';
import React from 'react';

import FormHelper from './FormHelper';
import styles from './styles.scss';

const propTypes = {
    /* list of elements to be validated */
    elements: PropTypes.arrayOf(PropTypes.string).isRequired,
    /* children of the form */
    children: PropTypes.node.isRequired, // eslint-disable-line
    /* fn to be called when value of any element change */
    changeCallback: PropTypes.func,
    /* fn to be called when form validation fails */
    failureCallback: PropTypes.func,
    /* fn to be called when form validation succeds */
    successCallback: PropTypes.func,
    /* dependency injected global function  to validate interdependent elements
     * should be created using createValidation helper function
    */
    validation: PropTypes.object, // eslint-disable-line
    /* map of validation function for individual element */
    validations: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    /* class name for styling */
    className: PropTypes.string,
    /* object with values */
    value: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    error: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    changeCallback: () => { console.log('No change callback'); },
    className: '',
    failureCallback: () => { console.log('No failure callback'); },
    successCallback: () => { console.log('No success callback'); },
    validation: undefined,
    validations: {},
    value: {},
    error: {},
};

const mapChildrenRecursive = (children, condition, propertyFn) => {
    const mapFn = (child) => {
        if (!React.isValidElement(child)) {
            return child;
        }
        const { props } = child;
        const newProperties = condition(props) ? propertyFn(props) : {};
        return React.cloneElement(child, {
            ...props,
            ...newProperties,
            children: mapChildrenRecursive(props.children, condition, propertyFn),
        });
    };
    if (React.Children.count(children) <= 1) {
        return mapFn(children);
    }
    return React.Children.map(children, mapFn);
};

/*
 * Form Component for field validations
 */
export default class Form extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const {
            changeCallback,
            elements,
            failureCallback,
            successCallback,
            validation,
            validations,
            value,
        } = this.props;

        const form = new FormHelper();
        form.setElements(elements);
        form.setValidations(validations);
        form.setValidation(validation);
        form.setCallbacks({
            changeCallback,
            failureCallback,
            successCallback,
        });
        form.setValue(value);

        this.form = form;
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.value !== nextProps.value) {
            this.form.setValue(nextProps.value);
        }
        if (this.props.elements !== nextProps.elements) {
            this.form.setElements(nextProps.elements);
        }
        if (this.props.validations !== nextProps.validations) {
            this.form.setValidations(nextProps.validations);
        }
        if (this.props.validation !== nextProps.validation) {
            this.form.setValidations(nextProps.validation);
        }
    }

    onSubmit = (e) => {
        e.preventDefault();
        this.form.onSubmit();
        return false;
    }

    // TODO: use requiredCondition here
    getCondition = props => (
        props.formname && props.formname.length > 0
    )

    getPropertyFn = props => ({
        onChange: this.form.getChangeFn(props.formname),
        value: this.props.value[props.formname],
        error: this.props.error[props.formname],
    })

    /* Submit a form from parent */
    submit = () => {
        this.form.onSubmit();
    }

    render() {
        const {
            children,
            className,
        } = this.props;

        return (
            <form
                className={`${className} ${styles.form}`}
                onSubmit={this.onSubmit}
                noValidate
            >
                { mapChildrenRecursive(
                    children,
                    this.getCondition,
                    this.getPropertyFn,
                ) }
            </form>
        );
    }
}

export * from './validations';
