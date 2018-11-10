import PropTypes from 'prop-types';
import React from 'react';

import { randomString } from '../../../../utils/common';
import { iconNames } from '../../../../constants';

import styles from './styles.scss';

const propTypes = {
    checked: PropTypes.bool,
    className: PropTypes.string,
    label: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
};

const defaultProps = {
    checked: false,
    className: '',
    disabled: false,
    readOnly: false,
};


export default class Option extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.inputId = randomString();
    }

    getClassNames = () => {
        const {
            checked,
            className,
            disabled,
            readOnly,
        } = this.props;

        const classNames = [
            styles.option,
            className,
            'radio-option',
        ];

        if (disabled) {
            classNames.push(styles.disabled);
        }

        if (readOnly) {
            classNames.push(styles.readOnly);
        }

        if (checked) {
            classNames.push('checked');
            classNames.push(styles.checked);
        }

        return classNames.join(' ');
    }

    render() {
        const {
            className, // eslint-disable-line no-unused-vars
            checked,
            label,
            disabled,
            readOnly,
            ...otherProps
        } = this.props;

        const radioClassNames = [
            styles.radio,
            'radio',
        ];

        if (checked) {
            radioClassNames.push(iconNames.radioOn);
        } else {
            radioClassNames.push(iconNames.radioOff);
        }

        return (
            <label
                htmlFor={this.inputId}
                className={this.getClassNames()}
            >
                <input
                    className={`${styles.input} input`}
                    defaultChecked={checked}
                    id={this.inputId}
                    type="radio"
                    disabled={disabled || readOnly}
                    {...otherProps}
                />
                <span className={radioClassNames.join(' ')} />
                <span className={`${styles.label} label`}>
                    { label }
                </span>
            </label>
        );
    }
}
