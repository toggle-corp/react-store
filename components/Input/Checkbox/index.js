import PropTypes from 'prop-types';
import React from 'react';
import { randomString } from '@togglecorp/fujs';
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
            className,
            value,
            disabled,
            readOnly,
            onChange, // eslint-disable-line no-unused-vars
            changeDelay, // eslint-disable-line no-unused-vars
            checkboxType, // eslint-disable-line no-unused-vars
            ...otherProps
        } = this.props;

        const classNames = [
            styles.checkbox,
            value ? styles.checked : '',
            className,
        ];

        if (disabled) {
            classNames.push('disabled');
            classNames.push(styles.disabled);
        }

        if (readOnly) {
            classNames.push('read-only');
            classNames.push(styles.readOnly);
        }

        const spanClassNames = [
            styles.checkmark,
            'checkmark',
            value ? this.props.checkboxType : iconNames.checkboxOutlineBlank,
        ];
        const inputClassNames = [
            'input',
            styles.input,
        ];
        const labelClassNames = [
            'label',
            styles.label,
        ];

        return (
            <label
                htmlFor={this.inputId}
                className={classNames.join(' ')}
                title={tooltip}
            >
                <span className={spanClassNames.join(' ')} />
                <input
                    onChange={this.handleInputChange}
                    className={inputClassNames.join(' ')}
                    type="checkbox"
                    checked={value}
                    id={this.inputId}
                    disabled={disabled || readOnly}
                    {...otherProps}
                />
                <span className={labelClassNames.join(' ')}>
                    { label }
                </span>
            </label>
        );
    }
}

export default FaramInputElement(Checkbox);
