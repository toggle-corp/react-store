import CSSModules from 'react-css-modules';
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
     * children can contain a simple string or a react element
     */
    children: PropTypes.oneOfType([
        PropTypes.element,
        PropTypes.string,
    ]).isRequired,

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
};

const defaultProps = {
    buttonType: 'button-default',
    disabled: false,
    iconName: undefined,
    onClick: () => {},
};

/**
 * Basic button component
 */
@CSSModules(styles, { allowMultiple: true })
export default class Button extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            buttonType,
            children,
            disabled,
            iconName,
            onClick,
        } = this.props;

        return (
            <button
                disabled={disabled}
                onClick={onClick}
                styleName={`button ${buttonType}`}
            >
                {
                    iconName &&
                    <i
                        className={iconName}
                        styleName="icon-button"
                    />
                }
                { children }
            </button>
        );
    }
}

export const PrimaryButton = props => (
    <Button buttonType="button-primary" {...props} />
);

export const accentButton = props => (
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

export const TransparentPrimaryButton = props => (
    <Button buttonType="button-primary transparent" {...props} />
);

export const TransparentAccentButton = props => (
    <Button buttonType="button-accent transparent" {...props} />
);

export const TransparentSuccessButton = props => (
    <Button buttonType="button-success transparent" {...props} />
);

export const TransparentDangerButton = props => (
    <Button buttonType="button-danger transparent" {...props} />
);

export const TransparentWarningButton = props => (
    <Button buttonType="button-warning transparent" {...props} />
);
