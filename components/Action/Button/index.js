import PropTypes from 'prop-types';
import React from 'react';
import { resolve, _cs } from '@togglecorp/fujs';
import { FaramActionElement } from '@togglecorp/faram';

import Spinner from '../../../v2/View/Spinner';
import Icon from '../../General/Icon';

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
    onClickParams: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),


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
    onClick: undefined,
    children: undefined,
    smallHorizontalPadding: false,
    smallVerticalPadding: false,
    transparent: false,
    changeDelay: 0,
    onClickParams: undefined,
};

function Button(props) {
    const {
        onClick,
        onClickParams,
        changeDelay,
        iconName,
        children,
        disabled,
        pending,
        type,
        buttonType,
        className: classNameFromProps,
        smallHorizontalPadding,
        smallVerticalPadding,
        transparent,

        ...otherProps
    } = props;

    const changeTimeoutRef = React.useRef(null);

    React.useEffect(() => (
        () => {
            window.clearTimeout(changeTimeoutRef.current);
        }
    ), []);

    const handleClick = React.useCallback((e) => {
        clearTimeout(changeTimeoutRef.current);

        if (!onClick) {
            return;
        }


        changeTimeoutRef.current = window.setTimeout(
            () => {
                onClick({
                    event: e,
                    params: resolve(onClickParams),
                });
            },
            changeDelay,
        );
    }, [onClick, changeDelay, onClickParams]);

    const buttonClassName = _cs(
        classNameFromProps,
        'button',
        styles.button,
        buttonType,
        buttonType && styles[buttonType],
        iconName && children && 'with-icon-and-children',
        iconName && children && styles.withIconAndChildren,

        smallHorizontalPadding && 'small-horizontal-padding',
        smallHorizontalPadding && styles.smallHorizontalPadding,
        smallVerticalPadding && 'small-vertical-padding',
        smallVerticalPadding && styles.smallVerticalPadding,

        transparent && 'transparent',
        transparent && styles.transparent,
    );

    const iconClassName = _cs(
        'icon',
        styles.icon,
    );

    /* eslint-disable react/button-has-type */
    return (
        <button
            className={buttonClassName}
            disabled={disabled || pending}
            onClick={handleClick}
            type={type}
            {...otherProps}
        >
            {pending ? (
                <Spinner
                    className={styles.spinner}
                    size="small"
                />
            ) : (
                <Icon
                    name={iconName}
                    className={iconClassName}
                />
            )}
            { children }
        </button>
    );
    /* eslint-enable react/button-has-type */
}

Button.propTypes = propTypes;
Button.defaultProps = defaultProps;

export default FaramActionElement(Button);
