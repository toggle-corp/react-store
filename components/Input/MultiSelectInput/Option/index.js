import React from 'react';
import PropTypes from 'prop-types';

import Checkbox from '../Checkbox';
import styles from './styles.scss';

const propTypes = {
    active: PropTypes.bool.isRequired,
    className: PropTypes.string,
    onClick: PropTypes.func.isRequired,
    optionKey: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]).isRequired,
    optionLabel: PropTypes.string,
};

const defaultProps = {
    className: '',
    optionLabel: '',
};

export default class Option extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getClassName = () => {
        const {
            active,
            className,
        } = this.props;

        const classNames = [
            className,
            'option',
            styles.option,
        ];

        if (active) {
            classNames.push('active');
        }

        return classNames.join(' ');
    }

    handleClick = () => {
        const {
            onClick,
            optionKey,
        } = this.props;

        onClick(optionKey);
    }

    render() {
        const {
            optionLabel,
            active,
        } = this.props;

        const className = this.getClassName();

        return (
            <button
                className={className}
                onClick={this.handleClick}
            >
                <Checkbox active={active} />
                { optionLabel }
            </button>
        );
    }
}
