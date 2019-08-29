import React from 'react';

import { _cs } from '@togglecorp/fujs';
import styles from './styles.scss';

interface Props {
    show?: boolean;
    text?: string;
    error?: boolean;
    className?: string;
    active?: boolean;
    disabled?: boolean;
}

export default class Label extends React.PureComponent<Props> {
    public static defaultProps = {
        className: '',
        text: '',
        error: false,
        show: true,
        active: false,
        disabled: false,
    };

    public render() {
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
                {text}
            </div>
        );
    }
}
