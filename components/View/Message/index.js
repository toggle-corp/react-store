import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

const propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.Element,
    ]),
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
    children: undefined,
};

export default class Message extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getClassName = () => {
        const { className } = this.props;
        return `${className} ${styles.message}`;
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
