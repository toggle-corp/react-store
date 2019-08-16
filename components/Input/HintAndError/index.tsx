import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.scss';

interface Props {
    show?: boolean;
    error?: boolean;
    hint?: string;
}

export default class HintAndError extends React.PureComponent<Props> {
    static defaultProps = {
        show: true,
    };

    render() {
        const {
            show,
            error,
            hint,
        } = this.props;

        if (!show) {
            return null;
        }

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

        const message = error ? hint : undefined;

        return (
            <div
                className={className}
                title={message}
            >
                { message || '-' }
            </div>
        );
    }
}
