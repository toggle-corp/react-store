import PropTypes from 'prop-types';
import React from 'react';

import { iconNames } from '../../../constants';
import Message from '../Message';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    message: PropTypes.string,
};

const defaultProps = {
    className: '',
    message: undefined,
};

export default class LoadingAnimation extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getClassName = () => {
        const { className } = this.props;

        const classNames = [
            className,
            styles.loadingAnimation,
        ];
        return classNames.join(' ');
    }

    render() {
        const {
            message,
        } = this.props;

        const className = this.getClassName();
        const iconClassName = `
            ${iconNames.loading}
            ${styles.icon}
            loading-icon
        `;

        return (
            <Message className={className}>
                <span className={iconClassName} />
                { message && (
                    <span className={styles.message}>
                        {message}
                    </span>
                )}
            </Message>
        );
    }
}
