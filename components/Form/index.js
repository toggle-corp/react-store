/**
 * @author tnagorra <weathermist@gmail.com>
 */
import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import FormHelper from './FormHelper';
import styles from './styles.scss';

const propTypes = {
    /* fn to be called when value of any element change */
    changeCallback: PropTypes.func,
    /* children of the form */
    children: PropTypes.node.isRequired, // eslint-disable-line
    /* class name for styling */
    className: PropTypes.string,
    /* list of elements to be validated */
    elements: PropTypes.arrayOf(PropTypes.string).isRequired,
    /* fn to be called when form validation fails */
    failureCallback: PropTypes.func,
    /* fn to be called when form validation succeds */
    successCallback: PropTypes.func,
    /* dependency injected global function  to validate interdependent elements
     * should be created using createValidation helper function
    */
    validation: PropTypes.object, // eslint-disable-line
    /* map of validation function for individual element */
    validations: PropTypes.object, // eslint-disable-line
};

const defaultProps = {
    changeCallback: () => { console.log('No change callback'); },
    className: '',
    failureCallback: () => { console.log('No failure callback'); },
    successCallback: () => { console.log('No success callback'); },
    validation: undefined,
    validations: {},
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
@CSSModules(styles)
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

        this.form = form;
    }

    onSubmit = (e) => {
        e.preventDefault();
        this.form.onSubmit();
        return false;
    }

    getCondition = props => (
        props.formname && props.formname.length > 0
    )

    getPropertyFn = props => ({
        ref: this.form.updateRef(props.formname),
        onChange: this.form.updateChangeFn(props.formname),
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
                className={className}
                onSubmit={this.onSubmit}
                styleName="form"
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
