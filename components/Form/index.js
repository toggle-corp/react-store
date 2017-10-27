/**
 * @author tnagorra <weathermist@gmail.com>
 */
import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import FormHelper from './FormHelper';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    changeCallback: PropTypes.func,
    children: PropTypes.node.isRequired, // eslint-disable-line
    elements: PropTypes.array.isRequired, // eslint-disable-line
    failureCallback: PropTypes.func,
    successCallback: PropTypes.func,
    validation: PropTypes.object, // eslint-disable-line
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

// NOTE: various optimizations can be done for this function
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

    // TODO: check if formname is string and length > 0
    getCondition = props => (
        props.formname && props.formname.length > 0
    )

    getPropertyFn = props => ({
        ref: this.form.updateRef(props.formname),
        onChange: this.form.updateChangeFn(props.formname),
    })

    // access this from outside
    submit = () => {
        this.form.obSubmit();
    }

    render() {
        const {
            className,
            children,
        } = this.props;

        return (
            <form
                className={className}
                styleName="form"
                onSubmit={this.onSubmit}
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
