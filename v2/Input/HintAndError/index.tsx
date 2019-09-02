import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.scss';

interface Props {
    error?: string;
    hint?: string;
}

function HintAndError(props: Props) {
    const {
        error,
        hint,
    } = props;

    const className = _cs(
        styles.inputHintAndError,
        'input-hint-and-error',
        error && styles.inputError,
        error && 'input-error',
        hint && styles.inputHint,
        hint && 'input-hint',
        !(hint || error) && styles.empty,
        !(hint || error) && 'empty',
    );

    const message = error || hint;

    return (
        <div
            className={className}
            title={message}
        >
            { message || '-' }
        </div>
    );
}

export default HintAndError;
