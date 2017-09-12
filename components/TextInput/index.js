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
    required: PropTypes.bool,
    error: PropTypes.string,
    onFocusIn: PropTypes.func.isRequired,
};

const defaultProps = {
    value: '',
    label: '',
    hint: '',
    required: false,
    error: '',
};

@CSSModules(styles, { allowMultiple: true })
export default class TextInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            value: this.props.value,
            focused: false,
        };

        this.inputId = randomString();
    }

    // Publics
    value = () => this.state.value;
    isFocused = () => this.state.focused;

    handleChange = (event) => {
        const { value } = event.target;
        this.setState({ value });
    }

    handleFocus = () => {
        this.setState(
            { focused: true },
            () => { this.props.onFocusIn(); },
        );
    }

    handleBlur = () => {
        this.setState({ focused: false });
    }

    renderError = () => {
    }

    render() {
        const { label, error, required } = this.props;
        const { value, focused } = this.state;

        return (
            <div styleName="text-input-wrapper">
                <div
                    styleName={`
                        text-input
                        ${focused ? 'focused' : ''}
                        ${error ? 'invalid' : ''}
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
                <p styleName="error">
                    {error}
                </p>
                <p styleName="hint">
                    {this.props.hint}
                </p>
            </div>
        );
    }
}
