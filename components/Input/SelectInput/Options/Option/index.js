import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    optionKey: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]).isRequired,
    onClick: PropTypes.func.isRequired,
    children: PropTypes.node,
    isActive: PropTypes.bool,
};

const defaultProps = {
    isActive: false,
    className: '',
    children: undefined,
};

export default class Option extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getClassName = () => {
        const {
            className,
            isActive,
        } = this.props;

        const classNames = [
            className,
            styles.option,
            'option',
        ];

        if (isActive) {
            classNames.push(styles.active);
            classNames.push('active');
        }

        return classNames.join(' ');
    }

    handleClick = () => {
        const {
            optionKey,
            onClick,
        } = this.props;

        onClick(optionKey);
    }

    render() {
        const { children } = this.props;

        const className = this.getClassName();

        return (
            <button
                className={className}
                onClick={this.handleClick}
            >
                { children }
            </button>
        );
    }
}
