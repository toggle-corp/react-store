import PropTypes from 'prop-types';
import React from 'react';
import { _cs, randomString } from '@togglecorp/fujs';

import Icon from '../../../General/Icon';

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

    render() {
        const {
            className: classNameFromProps,
            checked,
            label,
            disabled,
            readOnly,
            ...otherProps
        } = this.props;

        const className = _cs(
            styles.option,
            'radio-option',
            classNameFromProps,
            disabled && styles.disabled,
            readOnly && styles.readOnly,
            checked && styles.checked,
            checked && 'checked',
        );

        const radioClassName = _cs(
            styles.radio,
            'radio',
        );

        return (
            <label
                htmlFor={this.inputId}
                className={className}
            >
                <input
                    className={`${styles.input} input`}
                    defaultChecked={checked}
                    id={this.inputId}
                    type="radio"
                    disabled={disabled || readOnly}
                    {...otherProps}
                />
                <Icon
                    className={radioClassName}
                    name={checked ? 'radioOn' : 'radioOff'}
                />
                <span className={`${styles.label} label`}>
                    { label }
                </span>
            </label>
        );
    }
}
