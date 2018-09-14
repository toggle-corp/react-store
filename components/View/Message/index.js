import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

const propTypes = {
    children: PropTypes.node,
    className: PropTypes.string.isRequired,
    large: PropTypes.bool,
};

const defaultProps = {
    className: '',
    children: undefined,
    large: false,
};

export default class Message extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getClassName = () => {
        const {
            className,
            large,
        } = this.props;

        return `
            ${className}
            ${styles.message}
            ${large ? 'large' : ''}
        `;
    }

    render() {
        const { children } = this.props;
        const className = this.getClassName();

        return (
            <div className={className}>
                { children }
            </div>
        );
    }
}
