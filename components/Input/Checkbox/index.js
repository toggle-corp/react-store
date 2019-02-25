import PropTypes from 'prop-types';
import React from 'react';
import {
    randomString,
    _cs,
} from '@togglecorp/fujs';
import { FaramInputElement } from '@togglecorp/faram';

import { iconNames } from '../../../constants';

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
    checkboxType: iconNames.checkbox,
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
            onChange, // eslint-disable-line no-unused-vars
            changeDelay, // eslint-disable-line no-unused-vars
            checkboxType,
            ...otherProps
        } = this.props;

        const className = _cs(
            styles.checkbox,
            'checkbox',
            classNameFromProps,
            value && styles.checked,
            value && 'checked',
            disabled && styles.disabled,
            disabled && 'disabled',
            readOnly && styles.readOnly,
            readOnly && 'read-only',
        );

        const iconClassName = _cs(
            styles.checkmark,
            'checkmark',
            value ? checkboxType : iconNames.checkboxOutlineBlank,
        );

        const inputClassName = _cs(
            'raw-input',
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
                <div className={iconClassName} />
                <input
                    onChange={this.handleInputChange}
                    className={inputClassName}
                    type="checkbox"
                    checked={value}
                    id={this.inputId}
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
