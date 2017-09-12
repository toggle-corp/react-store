import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';
import {
    randomString,
} from '../../../public/utils/common';

const propTypes = {
    error: PropTypes.string,
    hint: PropTypes.string,
    label: PropTypes.string,
    onBlur: PropTypes.func,
    onFocus: PropTypes.func,
    required: PropTypes.bool,
    value: PropTypes.string,
};

const defaultProps = {
    error: '',
    hint: '',
    label: '',
    onBlur: undefined,
    onFocus: undefined,
    required: false,
    value: '',
};

@CSSModules(styles, { allowMultiple: true })
export default class TextInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            focused: false,
            value: this.props.value,
        };

        this.inputId = randomString();
    }

    // Public method used by Form
    value = () => this.state.value;

    // Public method used by Form
    isFocused = () => this.state.focused;

    // TODO: implement componentWillReceiveProps

    handleChange = (event) => {
        const { value } = event.target;
        this.setState({ value });
    }

    handleFocus = () => {
        // TODO: move this in constructor
        const invokeFocusCallback = () => {
            // invoke onFocus callback if defined
            const { onFocus } = this.props;
            if (onFocus) {
                onFocus();
            }
        };

        // Invoke only after state has changed
        this.setState({ focused: true }, invokeFocusCallback);
    }

    handleBlur = () => {
        // TODO: move this in constructor
        const invokeBlurCallback = () => {
            // invoke onBlur callback if defined
            const { onBlur } = this.props;
            if (onBlur) {
                onBlur();
            }
        };

        // Invoke only after state has changed
        this.setState({ focused: false }, invokeBlurCallback);
    }

    render() {
        const {
            error,
            label,
            required,
        } = this.props;
        const {
            focused,
            value,
        } = this.state;

        return (
            <div styleName="text-input-wrapper">
                <div
                    styleName={`
                        text-input
                        ${error ? 'invalid' : ''}
                        ${focused ? 'focused' : ''}
                        ${required ? 'required' : ''}
                    `}
                >
                    <label
                        htmlFor={this.inputId}
                        styleName="label"
                    >
                        {label}
                    </label>
                    <input
                        id={this.inputId}
                        onBlur={this.handleBlur}
                        onChange={this.handleChange}
                        onFocus={this.handleFocus}
                        styleName="input"
                        type="text"
                        value={value}
                    />
                </div>
                {
                    !error &&
                    <p styleName="hint">
                        {this.props.hint}
                    </p>
                }
                {
                    error &&
                    <p styleName="error">
                        {error}
                    </p>
                }
            </div>
        );
    }
}
