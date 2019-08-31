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

function Label(props: Props) {
    const {
        text,
        error,
        className: classNameFromProps,
        active,
        disabled,
        ...otherProps
    } = props;

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
Label.defaultProps = {
    active: false,
    disabled: false,
    error: false,
};

export default Label;
