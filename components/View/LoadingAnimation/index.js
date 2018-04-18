import PropTypes from 'prop-types';
import React from 'react';

import { iconNames } from '../../../constants';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    small: PropTypes.bool,
    medium: PropTypes.bool,
    large: PropTypes.bool,
    message: PropTypes.string,
};

const defaultProps = {
    className: '',
    small: false,
    medium: false,
    large: false,
    message: undefined,
};

export default class LoadingAnimation extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getClassName = () => {
        const {
            className,
            small,
            medium,
            large,
        } = this.props;

        const classNames = [
            className,
            styles.loadingAnimation,
        ];

        if (small) {
            classNames.push(styles.small);
        }

        if (medium) {
            classNames.push(styles.medium);
        }

        if (large) {
            classNames.push(styles.large);
        }

        if (!small && !medium && !large) {
            classNames.push(styles.large);
        }

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
        `;

        return (
            <div className={className}>
                <span className={iconClassName} />
                {
                    message && (
                        <span className={styles.message}>
                            {message}
                        </span>
                    )
                }
            </div>
        );
    }
}
