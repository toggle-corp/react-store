import PropTypes from 'prop-types';
import React from 'react';
import { FaramActionElement } from '@togglecorp/faram';
import { _cs } from '@togglecorp/fujs';

import { iconNames } from '../../../constants';

import styles from './styles.scss';

const propTypes = {
    changeDelay: PropTypes.number,
    children: PropTypes.node,
    className: PropTypes.string,
    disabled: PropTypes.bool,
    iconName: PropTypes.string,
    onClick: PropTypes.func,
    pending: PropTypes.bool,
    transparent: PropTypes.bool,
    type: PropTypes.string,
};

const defaultProps = {
    changeDelay: 0,
    children: undefined,
    className: undefined,
    disabled: false,
    iconName: undefined,
    onClick: undefined,
    pending: false,
    transparent: false,
    type: 'button',
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

class Button extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

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
            className: classNameFromProps,
            children,
            disabled,
            pending,
            type,

            ...otherProps
        } = this.props;

        const className = _cs(
            classNameFromProps,
            styles.button,
        );

        return (
            <button
                className={className}
                disabled={disabled || pending}
                onClick={this.handleClick}
                type={type}
                {...otherProps}
            >
                { children }
                <div className={styles.hoverLayer} />
            </button>
        );
    }
}

export default FaramActionElement(Button);
