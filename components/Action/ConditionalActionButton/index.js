import PropTypes from 'prop-types';
import React from 'react';

import { FaramActionElement } from '../../General/FaramElements';
import Button from '../Button';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    activeClassName: PropTypes.string,
    condition: PropTypes.func,
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object,
        PropTypes.array,
        PropTypes.number,
    ]),
    onClick: PropTypes.func,
};

const defaultProps = {
    className: '',
    onClick: () => {},
    value: {},
    condition: () => false,
    activeClassName: '',
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
            value, // eslint-disable-line no-unused-vars
            className, // eslint-disable-line no-unused-vars
            activeClassName, // eslint-disable-line no-unused-vars
            onClick, // eslint-disable-line no-unused-vars
            condition, // eslint-disable-line no-unused-vars
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
