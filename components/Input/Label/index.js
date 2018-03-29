import React from 'react';
import PropTypes from 'prop-types';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    show: PropTypes.bool.isRequired,
    text: PropTypes.string,
};

const defaultProps = {
    className: '',
    text: '',
};

export default class Label extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getClassName = () => {
        const { className } = this.props;
        const classNames = [
            className,
            'label',
            styles.label,
        ];

        return classNames.join(' ');
    }

    render() {
        const {
            show,
            text,
        } = this.props;

        if (!show) {
            return null;
        }

        const className = this.getClassName();

        return (
            <div className={className}>
                { text }
            </div>
        );
    }
}
