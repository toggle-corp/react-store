import React, { forwardRef } from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.scss';

interface Props extends Omit<React.HTMLProps<HTMLInputElement>, 'ref'> {
    className?: string;
}

function RawInput(props: Props, ref: React.Ref<HTMLInputElement>) {
    const {
        className: classNameFromProps,
        ...otherProps
    } = props;

    const className = _cs(
        classNameFromProps,
        styles.rawInput,
        'raw-input',
    );

    return (
        <input
            ref={ref}
            className={className}
            {...otherProps}
        />
    );
}

export default forwardRef(RawInput);
