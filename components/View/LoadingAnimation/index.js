import PropTypes from 'prop-types';
import React from 'react';

import { typeOf, _cs } from '@togglecorp/fujs';

import Message from '../Message';
import Spinner from '../Spinner';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    message: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.node,
    ]),
    delay: PropTypes.number,
    spinnerClassName: PropTypes.string,
};

const defaultProps = {
    className: '',
    message: undefined,
    spinnerClassName: undefined,
    delay: 0,
};

export default class LoadingAnimation extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = { showMessage: false };
    }

    componentDidMount() {
        const { delay } = this.props;

        this.timeout = setTimeout(() => {
            this.setState({ showMessage: true });
        }, delay);
    }

    componentWillUnmount() {
        clearTimeout(this.timeout);
    }

    renderMessage = () => {
        const { message } = this.props;

        const isNode = typeOf(message) === 'object';

        if (isNode) {
            return message;
        }

        return (
            <span className={styles.message}>
                {message}
            </span>
        );
    }

    render() {
        const {
            className: classNameFromProps,
            delay, // eslint-disable-line no-unused-vars
            message,
            spinnerClassName,
            ...otherProps
        } = this.props;

        const { showMessage } = this.state;

        const LoadingMessage = this.renderMessage;

        return (
            <Message
                className={_cs(styles.loadingAnimation, classNameFromProps)}
                {...otherProps}
            >
                <Spinner className={spinnerClassName} />
                { message && showMessage && <LoadingMessage />}
            </Message>
        );
    }
}
