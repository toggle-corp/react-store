import PropTypes from 'prop-types';
import React from 'react';

import { iconNames } from '../../../constants';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    children: PropTypes.string,
};

const defaultProps = {
    className: '',
    children: null,
};

export default class LoadingAnimation extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className,
            children,
        } = this.props;

        return (
            <div className={`${styles.loadingAnimation} ${className}`}>
                <span className={`${iconNames.loading} ${styles.icon}`} />
                { children &&
                    <span className={styles.message}>
                        {children}
                    </span>
                }
            </div>
        );
    }
}
