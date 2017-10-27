import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';
import {
    randomString,
} from '../../../public/utils/common';


const propTypes = {
    /**
     * required for style override
     */
    className: PropTypes.string,

    /**
     * String to show in case of error
     */
    error: PropTypes.string,

    /**
     * Hint text
     */
    hint: PropTypes.string,

    /**
     * Initial value for the input
     */
    initialValue: PropTypes.string,

    /**
     * Input label
     */
    label: PropTypes.string,

    /**
     * A callback for when the input loses focus
     */
    onBlur: PropTypes.func,

    /**
     * A callback for when the input changes its content
     */
    onChange: PropTypes.func,

    /**
     * A callback for when the input gets focus
     */
    onFocus: PropTypes.func,

    /**
     * Is a required element for form
     */
    required: PropTypes.bool,
};

const defaultProps = {
    className: '',
    error: '',
    hint: '',
    initialValue: '',
    label: '',
    onBlur: undefined,
    onChange: undefined,
    onFocus: undefined,
    required: false,
};

@CSSModules(styles, { allowMultiple: true })
export default class TextInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            focused: false,
            value: this.props.initialValue,
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

        if (this.props.onChange) {
            this.props.onChange(value);
        }
    }

    invokeFocusCallback = () => {
        // invoke onFocus callback if defined
        const { onFocus } = this.props;
        if (onFocus) {
            onFocus();
        }
    };

    // TODO: move this in constructor
    invokeBlurCallback = () => {
        // invoke onBlur callback if defined
        const { onBlur } = this.props;
        if (onBlur) {
            onBlur();
        }
    };

    handleFocus = () => {
        // Invoke focus callback only after state has changed
        this.setState({ focused: true }, this.invokeFocusCallback);
    }

    handleBlur = () => {
        // Invoke blur callback only after state has changed
        this.setState({ focused: false }, this.invokeBlurCallback);
    }

    render() {
        console.log('Rendering TextInput');

        const {
            // NOTE: Professional stuff, don't try to alter these
            initialValue, // eslint-disable-line
            onBlur, // eslint-disable-line
            onChange, // eslint-disable-line
            onFocus, // eslint-disable-line

            error,
            hint,
            label,
            required,
            ...otherProps
        } = this.props;

        const {
            focused,
            value,
        } = this.state;

        return (
            <div
                styleName="text-input-wrapper"
                className={this.props.className}
            >
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
                        value={value}
                        {...otherProps}
                    />
                </div>
                {
                    !error && hint &&
                    <p styleName="hint">
                        {hint}
                    </p>
                }
                {
                    error && !hint &&
                    <p styleName="error">
                        {error}
                    </p>
                }
                {
                    !error && !hint &&
                    <p styleName="empty">
                        -
                    </p>
                }
            </div>
        );
    }
}
