import React from 'react';

import Checkbox from '../Checkbox';
import styles from './styles.scss';

const propTypes = {
};

const defaultProps = {
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
            classNames.push(styles.active);
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
