import PropTypes from 'prop-types';
import React from 'react';
import { randomString, _cs } from '@togglecorp/fujs';
import { FaramInputElement } from '@togglecorp/faram';

import Icon from '../../General/Icon';

import styles from './styles.scss';

const propTypes = {
    /**
     * for styling by className
     */
    className: PropTypes.string,

    /**
     * Is input disabled?
     */
    disabled: PropTypes.bool,

    value: PropTypes.bool,

    /**
     * A callback for when the input changes its content
     */
    onChange: PropTypes.func.isRequired,

    /**
     * label for the checkbox
     */
    label: PropTypes.node.isRequired,

    tooltip: PropTypes.string,

    readOnly: PropTypes.bool,

    checkboxType: PropTypes.string,

    // FIXME
    changeDelay: PropTypes.number,
};

const defaultProps = {
    className: '',
    disabled: false,
    checkboxType: 'checkbox',
    tooltip: '',
    readOnly: false,
    value: false,
    changeDelay: undefined,
};

class Checkbox extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.inputId = randomString();
    }

    handleInputChange = (e) => {
        const value = e.target.checked;
        this.props.onChange(value);
    }

    render() {
        const {
            label,
            tooltip,
            className: classNameFromProps,
            value,
            disabled,
            readOnly,
            checkboxType,
            onChange, // eslint-disable-line no-unused-vars
            changeDelay, // eslint-disable-line no-unused-vars
            ...otherProps
        } = this.props;

        const className = _cs(
            styles.checkbox,
            value && styles.checked,
            classNameFromProps,
            disabled && 'disabled',
            disabled && styles.disabled,
            readOnly && 'read-only',
            readOnly && styles.readOnly,
        );

        const spanClassName = _cs(
            styles.checkmark,
            'checkmark',
        );

        const inputClassName = _cs(
            'input',
            styles.input,
        );

        const labelClassName = _cs(
            'label',
            styles.label,
        );

        return (
            <label
                htmlFor={this.inputId}
                className={className}
                title={tooltip}
            >
                <Icon
                    name={value ? checkboxType : 'checkboxOutlineBlank'}
                    className={spanClassName}
                />
                <input
                    id={this.inputId}
                    onChange={this.handleInputChange}
                    className={inputClassName}
                    type="checkbox"
                    checked={value}
                    disabled={disabled || readOnly}
                    {...otherProps}
                />
                <div className={labelClassName}>
                    { label }
                </div>
            </label>
        );
    }
}

export default FaramInputElement(Checkbox);
