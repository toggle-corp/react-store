import React from 'react';
import PropTypes from 'prop-types';

import { _cs } from './../../../utils/common';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    error: PropTypes.bool,
    show: PropTypes.bool,
    active: PropTypes.bool,
    disabled: PropTypes.bool,
    text: PropTypes.string,
};

const defaultProps = {
    className: '',
    error: false,
    show: true,
    text: '',
    active: false,
    disabled: false,
};

const emptyText = '-';

export default class InputLabel extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            show,
            text,
            error,
            className: classNameFromProps,
            active,
            disabled,
            ...otherProps
        } = this.props;

        if (!show) {
            return null;
        }

        const className = _cs(
            classNameFromProps,
            'input-label',
            styles.inputLabel,
            !text && 'empty',
            !text && styles.empty,
            error && styles.error,
            error && 'error',
            active && styles.active,
            active && 'active',
            disabled && styles.disabled,
            disabled && 'disabled',
        );

        return (
            <div
                className={className}
                title={text}
                {...otherProps}
            >
                { text || emptyText }
            </div>
        );
    }
}
