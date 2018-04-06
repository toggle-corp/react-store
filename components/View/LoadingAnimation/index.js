import PropTypes from 'prop-types';
import React from 'react';

import loading from '../../../resources/img/loading.gif';
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
                <img src={loading} alt="loading" />
                { children &&
                    <span className={styles.message}>
                        {children}
                    </span>
                }
            </div>
        );
    }
}
