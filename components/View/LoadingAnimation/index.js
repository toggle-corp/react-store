import PropTypes from 'prop-types';
import React from 'react';

import { typeOf } from '@togglecorp/fujs';

import Icon from '../../General/Icon';
import Message from '../Message';
import Spinner from '../../View/Spinner';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    message: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.node,
    ]),
    delay: PropTypes.number,
};

const defaultProps = {
    className: '',
    message: undefined,
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

    getClassName = () => {
        const { className } = this.props;

        const classNames = [
            className,
            styles.loadingAnimation,
        ];
        return classNames.join(' ');
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
            delay,
            message,
            ...otherProps
        } = this.props;

        const { showMessage } = this.state;

        const className = this.getClassName();
        const iconClassName = `
            ${styles.icon}
            loading-icon
        `;
        const LoadingMessage = this.renderMessage;

        return (
            <Message
                className={className}
                {...otherProps}
            >
                <Spinner />
                { message && showMessage && <LoadingMessage />}
            </Message>
        );
    }
}
