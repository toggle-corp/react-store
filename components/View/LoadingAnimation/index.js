import PropTypes from 'prop-types';
import React from 'react';

import { iconNames } from '../../../constants';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

export default class LoadingAnimation extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className,
        } = this.props;

        return (
            <div className={`${styles.loadingAnimation} ${className}`}>
                <span className={`${iconNames.loading} ${styles.icon}`} />
            </div>
        );
    }
}
