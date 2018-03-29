import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

import styles from './styles.scss';

const propTypes = {
    show: PropTypes.bool.isRequired,
    error: PropTypes.string,
    hint: PropTypes.string,
};

const defaultProps = {
    error: undefined,
    hint: undefined,
};

export default class HintAndError extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    renderError = () => {
        const { error } = this.props;

        if (!error) {
            return null;
        }

        return (
            <p className={`error ${styles.error}`}>
                {error}
            </p>
        );
    }

    renderHint = () => {
        const {
            error,
            hint,
        } = this.props;

        if (error || !hint) {
            return null;
        }

        return (
            <p className={`hint ${styles.hint}`}>
                {hint}
            </p>
        );
    }

    renderEmpty = () => {
        const {
            hint,
            error,
        } = this.props;

        if (hint || error) {
            return null;
        }

        const emptyText = '-';
        return (
            <p className={`empty ${styles.empty}`}>
                { emptyText }
            </p>
        );
    }

    render() {
        const { show } = this.props;

        if (!show) {
            return null;
        }

        const Error = this.renderError;
        const Hint = this.renderHint;
        const Empty = this.renderEmpty;

        return (
            <Fragment>
                <Hint />
                <Error />
                <Empty />
            </Fragment>
        );
    }
}
