import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.scss';

interface Props {
    active: boolean;
    className?: string;
    disabled: boolean;
    error: boolean;
    text?: string;
}

export default class Label extends React.PureComponent<Props> {
    public static defaultProps = {
        active: false,
        disabled: false,
        error: false,
    };

    public render() {
        const {
            text,
            error,
            className: classNameFromProps,
            active,
            disabled,
            ...otherProps
        } = this.props;

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
