import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';
import {
    randomString,
} from '../../../utils/common';


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
export default class TextArea extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            value: this.props.initialValue,
        };

        this.inputId = randomString();
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            value: nextProps.initialValue,
        });
    }

    getValue = () => this.state.value;

    handleChange = (event) => {
        const { value } = event.target;
        this.setState({ value });

        if (this.props.onChange) {
            this.props.onChange(value);
        }
    }

    render() {
        console.log('Rendering TextInput');
        const {
            // skip prop injection for initialValue & onChange (used internally)
            initialValue, // eslint-disable-line
            onChange, // eslint-disable-line

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
                styleName="textarea-wrapper"
                className={`textarea ${this.props.className}`}
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
                        className="label"
                        htmlFor={this.inputId}
                        styleName="label"
                    >
                        {label}
                    </label>
                    <textarea
                        className="input"
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
                    !error && hint && (
                        <p
                            className="hint"
                            styleName="hint"
                        >
                            {hint}
                        </p>
                    )
                }
                {
                    error && !hint && (
                        <p
                            styleName="error"
                            className="error"
                        >
                            {error}
                        </p>
                    )
                }
                {
                    !error && !hint && (
                        <p
                            styleName="empty"
                            className="error empty"
                        >
                            -
                        </p>
                    )
                }
            </div>
        );
    }
}
