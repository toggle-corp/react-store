import PropTypes from 'prop-types';
import React from 'react';

import { FaramActionElement } from '../../General/FaramElements';
import Button from '../Button';
import styles from './styles.scss';

const propTypes = {
};

const defaultProps = {
};

class ConditionalActionButton extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getClassName = () => {
        const {
            className,
            activeClassName,
            condition,
            value,
        } = this.props;

        const isActive = condition(value);
        const classNames = [
            styles.conditionalButton,
            className,
        ];
        if (isActive) {
            classNames.push(styles.active);
            classNames.push(activeClassName);
        }
        console.warn(classNames);
        return classNames.join(' ');
    }

    handleButtonClick = () => {
        const {
            condition,
            value,
            onClick,
        } = this.props;

        const isActive = condition(value);
        if (!isActive) {
            onClick();
        }
    }

    render() {
        const {
            value,
            className,
            onClick,
            condition,
            ...otherProps
        } = this.props;

        return (
            <Button
                className={this.getClassName()}
                onClick={this.handleButtonClick}
                {...otherProps}
            />
        );
    }
}

export default FaramActionElement(ConditionalActionButton);
