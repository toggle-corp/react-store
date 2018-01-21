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
     * Is input disabled?
     */
    disabled: PropTypes.bool,

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

    showLabel: PropTypes.bool,

    showHintAndError: PropTypes.bool,

    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),

    selectOnFocus: PropTypes.bool,
};

const defaultProps = {
    className: '',
    disabled: false,
    error: '',
    hint: '',
    initialValue: undefined,
    label: '',
    onBlur: undefined,
    onChange: undefined,
    onFocus: undefined,
    required: false,
    showLabel: true,
    showHintAndError: true,
    value: '',
    selectOnFocus: false,
};

@CSSModules(styles, { allowMultiple: true })
export default class TextInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.realValue = this.props.initialValue || this.props.value;
        this.state = {
            isFocused: false,
            value: this.realValue,
        };

        this.inputId = randomString();
    }

    componentWillReceiveProps(nextProps) {
        if (this.realValue !== nextProps.value) {
            this.realValue = nextProps.value;
            this.setState({
                value: this.realValue,
            });
        }
    }

    componentWillUnmount() {
        if (this.changeTimeout) {
            clearTimeout(this.changeTimeout);
        }
    }

    getValue = () => this.realValue;

    getStyleName() {
        const styleNames = [];

        const {
            disabled,
            error,
            required,
        } = this.props;

        const {
            isFocused,
        } = this.state;

        styleNames.push('text-input');

        if (disabled) {
            styleNames.push('disabled');
        }

        if (isFocused) {
            styleNames.push('focused');
        }

        if (error) {
            styleNames.push('error');
        }

        if (required) {
            styleNames.push('required');
        }

        return styleNames.join(' ');
    }

    handleChange = (event) => {
        const { value } = event.target;
        this.realValue = value;
        this.setState({ value: this.realValue });

        const { onChange } = this.props;
        if (onChange) {
            clearTimeout(this.changeTimeout);
            this.changeTimeout = setTimeout(() => onChange(this.realValue), 100);
        }
    }

    handleFocus = (event) => {
        const { selectOnFocus, onFocus } = this.props;
        if (selectOnFocus) {
            event.target.select();
        }

        this.setState({ isFocused: true });

        if (onFocus) {
            onFocus();
        }
    }

    handleBlur = () => {
        const { onBlur } = this.props;
        this.setState({ isFocused: false });
        if (onBlur) {
            onBlur();
        }
    }

    render() {
        const {
            // skip prop injection for initialValue & onChange (used internally)
            initialValue, // eslint-disable-line
            value: propValue, // eslint-disable-line
            onBlur, // eslint-disable-line
            onChange, // eslint-disable-line
            onFocus, // eslint-disable-line
            selectOnFocus, // eslint-disable-line
            className,

            error,
            hint,
            label,
            showLabel,
            showHintAndError,
            ...otherProps
        } = this.props;

        const { value = '' } = this.state;
        const styleName = this.getStyleName();

        return (
            <div
                className={`${styleName} ${className}`}
                styleName={styleName}
            >
                {
                    showLabel && (
                        <div
                            className="label"
                            styleName="label"
                        >
                            {label}
                        </div>
                    )
                }
                <input
                    className="input"
                    id={this.inputId}
                    onBlur={this.handleBlur}
                    onChange={this.handleChange}
                    onFocus={this.handleFocus}
                    styleName="input"
                    value={value}
                    {...otherProps}
                />
                {
                    showHintAndError && [
                        !error && hint && (
                            <p
                                key="hint"
                                className="hint"
                                styleName="hint"
                            >
                                {hint}
                            </p>
                        ),
                        error && !hint && (
                            <p
                                key="error"
                                styleName="error"
                                className="error"
                            >
                                {error}
                            </p>
                        ),
                        !error && !hint && (
                            <p
                                key="empty"
                                styleName="empty"
                                className="error empty"
                            >
                                -
                            </p>
                        ),
                    ]
                }
            </div>
        );
    }
}
