import PropTypes from 'prop-types';
import React from 'react';

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
};

const defaultProps = {
    buttonType: 'button-default',
    className: '',
    disabled: false,
    iconName: undefined,
    onClick: () => {}, // no-op
    children: undefined,
    smallHorizontalPadding: false,
    smallVerticalPadding: false,
    transparent: false,
};

/**
 * Basic button component
 */
export default class Button extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getClassName = (props) => {
        const {
            buttonType,
            className,
            iconName,
            children,
            smallHorizontalPadding,
            smallVerticalPadding,
            transparent,
        } = props;

        const classNames = [];

        classNames.push('button');
        classNames.push(styles.button);

        if (className) {
            classNames.push(className);
        }

        if (buttonType) {
            classNames.push(buttonType);
            classNames.push(styles[buttonType]);
        }

        if (iconName && children) {
            classNames.push('with-icon-and-children');
            classNames.push(styles['with-icon-and-children']);
        }

        if (smallHorizontalPadding) {
            classNames.push(styles['small-horizontal-padding']);
        }

        if (smallVerticalPadding) {
            classNames.push(styles['small-vertical-padding']);
        }

        if (transparent) {
            classNames.push('transparent');
            classNames.push(styles.transparent);
        }

        return classNames.join(' ');
    }

    getIconClassName = (props) => {
        const { iconName } = props;

        const classNames = [];
        classNames.push('icon');
        classNames.push(styles.icon);

        classNames.push(iconName);

        return classNames.join(' ');
    }

    renderIcon = (props) => {
        const { iconName } = props;
        if (!iconName) {
            return null;
        }
        const iconClassName = this.getIconClassName(props);

        return (
            <i className={iconClassName} />
        );
    }

    render() {
        const {
            iconName,
            children,
            disabled,
            onClick,

            buttonType, // eslint-disable-line no-unused-vars
            className: captureClassName, // eslint-disable-line no-unused-vars
            smallHorizontalPadding, // eslint-disable-line no-unused-vars
            smallVerticalPadding, // eslint-disable-line no-unused-vars
            transparent, // eslint-disable-line no-unused-vars

            ...otherProps
        } = this.props;

        const className = this.getClassName(this.props);

        const Icon = this.renderIcon;

        return (
            <button
                className={className}
                disabled={disabled}
                onClick={onClick}
                {...otherProps}
            >
                <Icon iconName={iconName} />
                { children }
            </button>
        );
    }
}

export const PrimaryButton = props => (
    <Button buttonType="button-primary" {...props} />
);

export const AccentButton = props => (
    <Button buttonType="button-accent" {...props} />
);

export const SuccessButton = props => (
    <Button buttonType="button-success" {...props} />
);

export const DangerButton = props => (
    <Button buttonType="button-danger" {...props} />
);

export const WarningButton = props => (
    <Button buttonType="button-warning" {...props} />
);

export const TransparentButton = props => (
    <Button transparent {...props} />
);

export const TransparentPrimaryButton = props => (
    <Button buttonType="button-primary" transparent {...props} />
);

export const TransparentAccentButton = props => (
    <Button buttonType="button-accent" transparent {...props} />
);

export const TransparentSuccessButton = props => (
    <Button buttonType="button-success" transparent {...props} />
);

export const TransparentDangerButton = props => (
    <Button buttonType="button-danger" transparent {...props} />
);

export const TransparentWarningButton = props => (
    <Button buttonType="button-warning" transparent {...props} />
);
