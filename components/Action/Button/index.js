import PropTypes from 'prop-types';
import React from 'react';

import { iconNames } from '../../../constants';
import { FaramActionElement } from '../../General/FaramElements';

/*
eslint css-modules/no-unused-class: [
    1,
    {
        markAsUsed: [
            'button-default', 'button-accent', 'button-primary', 'button-danger',
            'button-warning', 'button-success'
        ],
        camelCase: true
    }
]
*/
import styles from './styles.scss';

const propTypes = {
    /**
     * buttonType is used to categorize a button:
     * default, primary, danger, warning, success
     * Generally user doesn't explicitly pass buttonType
     */
    buttonType: PropTypes.string,

    /**
     * required for style override
    */
    className: PropTypes.string,

    /**
     * children can contain a simple string or a react element
     */
    children: PropTypes.oneOfType([
        PropTypes.node,
        PropTypes.arrayOf(PropTypes.node),
    ]),

    /**
     * if disabled is true, the action is blocked
     */
    disabled: PropTypes.bool,

    /**
     * if pending is true, the action is blocked and it is indicated
     */
    pending: PropTypes.bool,

    /**
     * iconName is the name of the icon in Ionicons 2
     */
    iconName: PropTypes.string,

    /**
     * action to invoke when the button is clicked
     */
    onClick: PropTypes.func,


    /**
     * show small horizontal padding
     */
    smallHorizontalPadding: PropTypes.bool,

    /**
     * show small vertical padding
     */
    smallVerticalPadding: PropTypes.bool,

    /**
     * show small vertical padding
     */
    transparent: PropTypes.bool,

    type: PropTypes.string,

    changeDelay: PropTypes.number,
};

const defaultProps = {
    buttonType: 'button-default',
    type: 'button',
    className: '',
    disabled: false,
    pending: false,
    iconName: undefined,
    onClick: () => {}, // no-op
    children: undefined,
    smallHorizontalPadding: false,
    smallVerticalPadding: false,
    transparent: false,
    changeDelay: 0,
};

const emptyObject = {};
const isFunction = functionToCheck => (
    functionToCheck
    && {}.toString.call(functionToCheck) === '[object Function]'
);

const resolveToObject = (d) => {
    if (isFunction(d)) {
        return d();
    }

    return d || emptyObject;
};

/**
 * Basic button component
 */
class Button extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static getClassName = (props) => {
        const {
            buttonType,
            className,
            iconName,
            children,
            smallHorizontalPadding,
            smallVerticalPadding,
            transparent,
        } = props;

        const classNames = [
            className,
            'button',
            styles.button,
        ];

        if (buttonType) {
            classNames.push(buttonType);
            classNames.push(styles[buttonType]);
        }

        if (iconName && children) {
            classNames.push('with-icon-and-children');
            classNames.push(styles.withIconAndChildren);
        }

        if (smallHorizontalPadding) {
            classNames.push('small-horizontal-padding');
            classNames.push(styles.smallHorizontalPadding);
        }

        if (smallVerticalPadding) {
            classNames.push('small-vertical-padding');
            classNames.push(styles.smallVerticalPadding);
        }

        if (transparent) {
            classNames.push('transparent');
            classNames.push(styles.transparent);
        }

        return classNames.join(' ');
    }

    static getIconClassName = (props) => {
        const { iconName, className } = props;

        const classNames = [];
        classNames.push('icon');
        classNames.push(styles.icon);
        classNames.push(iconName);
        if (className) {
            classNames.push(className);
        }

        return classNames.join(' ');
    }

    componentWillUnmount() {
        if (this.changeTimeout) {
            clearTimeout(this.changeTimeout);
        }
    }

    handleClick = (e) => {
        clearTimeout(this.changeTimeout);
        this.pendingChange = true;
        const {
            onClick,
            onClickParams,
        } = this.props;

        this.changeTimeout = setTimeout(
            () => {
                this.pendingChange = false;
                onClick({
                    event: e,
                    params: resolveToObject(onClickParams),
                });
            },
            this.props.changeDelay,
        );
    }

    renderIcon = (props) => {
        const { iconName } = props;
        if (!iconName) {
            return null;
        }
        const iconClassName = Button.getIconClassName(props);

        return (
            <i className={iconClassName} />
        );
    }

    render() {
        const {
            iconName,
            children,
            disabled,
            pending,
            type,

            onClick, // eslint-disable-line no-unused-vars
            onClickParams, // eslint-disable-line no-unused-vars
            changeDelay, // eslint-disable-line no-unused-vars
            buttonType, // eslint-disable-line no-unused-vars
            className: captureClassName, // eslint-disable-line no-unused-vars
            smallHorizontalPadding, // eslint-disable-line no-unused-vars
            smallVerticalPadding, // eslint-disable-line no-unused-vars
            transparent, // eslint-disable-line no-unused-vars

            ...otherProps
        } = this.props;

        const className = Button.getClassName(this.props);

        const Icon = this.renderIcon;

        return (
            <button
                className={className}
                disabled={disabled || pending}
                onClick={this.handleClick}
                type={type}
                {...otherProps}
            >
                { pending &&
                    <Icon
                        className={styles.pendingIcon}
                        iconName={iconNames.loading}
                    />
                }
                <Icon iconName={iconName} />
                { children }
            </button>
        );
    }
}

export default FaramActionElement(Button);
