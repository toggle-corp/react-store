import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import { randomString } from '../../../utils/common';
import { iconNames } from '../../../constants';

import styles from './styles.scss';

const propTypes = {
    checked: PropTypes.bool,
    className: PropTypes.string,
    label: PropTypes.string.isRequired,
};

const defaultProps = {
    checked: false,
    className: '',
};


@CSSModules(styles, { allowMultiple: true })
export default class Option extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.inputId = randomString();
    }

    render() {
        const {
            checked,
            className,
            label,
            ...otherProps
        } = this.props;

        return (
            <label
                htmlFor={this.inputId}
                className={`${styles.option} ${checked ? styles.checked : ''} radio-option ${className}`}
            >
                <input
                    className={`${styles.input} input`}
                    defaultChecked={checked}
                    id={this.inputId}
                    type="radio"
                    {...otherProps}
                />
                <span className={`${styles.radio} radio ${checked ? iconNames.radioOn : iconNames.radioOff}`} />
                <span className={`${styles.label} label`}>
                    { label }
                </span>
            </label>
        );
    }
}
