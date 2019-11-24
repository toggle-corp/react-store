import React from 'react';
import PropTypes from 'prop-types';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.scss';

const propTypes = {
    show: PropTypes.bool,
    error: PropTypes.string,
    hint: PropTypes.string,
    persistent: PropTypes.bool,
};

const defaultProps = {
    show: true,
    error: undefined,
    hint: undefined,
    persistent: true,
};

const emptyText = '-';

export default class InputHintAndError extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    render() {
        const {
            show,
            error,
            hint,
            persistent,
        } = this.props;

        if (!show || (!persistent && !error)) {
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

        return (
            <div
                className={className}
                title={error || hint}
            >
                { error || hint || emptyText }
            </div>
        );
    }
}
