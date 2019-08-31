import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.scss';

interface Props extends Omit<React.HTMLProps<HTMLInputElement>, 'ref'> {
    className?: string;
    elementRef?: React.RefObject<HTMLInputElement>;
}

function RawInput(props: Props) {
    const {
        className: classNameFromProps,
        elementRef,
        ...otherProps
    } = props;

    const className = _cs(
        classNameFromProps,
        styles.rawInput,
        'raw-input',
    );

    return (
        <input
            ref={elementRef}
            className={className}
            {...otherProps}
        />
    );
}

export default RawInput;
