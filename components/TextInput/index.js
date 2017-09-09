import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';
import {
    randomString,
} from '../../../public/utils/common';

const propTypes = {
    value: PropTypes.string,
    label: PropTypes.string,
    hint: PropTypes.string,
    validator: PropTypes.func,
    required: PropTypes.bool,
};

const defaultProps = {
    value: '',
    label: '',
    hint: '',
    validator: undefined,
    required: false,
};

@CSSModules(styles, { allowMultiple: true })
export default class Table extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            value: this.props.value,
            focused: false,
            valid: true,
        };

        this.inputId = randomString();
    }

    handleChange = (event) => {
        const { validator } = this.props;
        const { value } = event.target;
        let valid = true;

        if (validator && value.length > 0) {
            const check = validator(value);
            valid = check.valid;

            this.errorMsg = check.valid ? undefined : check.errorMsg;
        } else {
            this.errorMsg = undefined;
        }

        this.setState({ value, valid });
    }

    handleFocus = () => {
        this.setState({ focused: true });
    }

    handleBlur = () => {
        this.setState({ focused: false });
    }

    renderError = () => {
        if (this.errorMsg && this.errorMsg.length > 0) {
            return (
                <p styleName="error">{this.errorMsg}</p>
            );
        }

        return '';
    }

    render() {
        const { label, hint, required } = this.props;
        const { value, focused, valid } = this.state;

        return (
            <div styleName="text-input-wrapper">
                <div
                    styleName={`
                        text-input
                        ${focused ? 'focused' : ''}
                        ${valid ? '' : 'invalid'}
                        ${required ? 'required' : ''}
                    `}
                >
                    <label
                        styleName="label"
                        htmlFor={this.inputId}
                    >
                        {label}
                    </label>
                    <input
                        id={this.inputId}
                        styleName="input"
                        type="text"
                        value={value}
                        onChange={this.handleChange}
                        onFocus={this.handleFocus}
                        onBlur={this.handleBlur}
                    />
                </div>
                { this.renderError() }
                <p styleName="hint">{hint}</p>
            </div>
        );
    }
}
