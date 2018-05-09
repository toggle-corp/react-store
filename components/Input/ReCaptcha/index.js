import React, { Component } from 'react';
import PropTypes from 'prop-types';

import FaramElement from '../../Input/Faram/FaramElement';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    siteKey: PropTypes.string.isRequired,

    onloadCallback: PropTypes.func,
    onChange: PropTypes.func,
    expiredCallback: PropTypes.func,

    theme: PropTypes.string,
    type: PropTypes.string,
    size: PropTypes.string,
    tabindex: PropTypes.string,
    hl: PropTypes.string,
    badge: PropTypes.string,

    showHintAndError: PropTypes.bool,
    error: PropTypes.string,
};

const defaultProps = {
    className: '',
    onloadCallback: undefined,
    onChange: undefined,
    expiredCallback: undefined,
    theme: 'light',
    type: 'image',
    size: 'normal',
    tabindex: '0',
    hl: 'en',
    badge: 'bottomright',

    showHintAndError: true,
    error: '',
};

class ReCaptcha extends Component {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static isReady = () => (window.grecaptcha !== undefined)

    constructor(props) {
        super(props);

        const ready = ReCaptcha.isReady();
        this.state = { ready };
    }

    componentWillMount() {
        this.pollForReadyState();
    }

    componentWillUnmount() {
        clearTimeout(this.readyCheck);
    }

    pollForReadyState = () => {
        if (ReCaptcha.isReady()) {
            this.setState({ ready: true }, this.renderGrecaptcha);
        } else {
            this.readyCheck = setTimeout(this.pollForReadyState, 1000);
        }
    };

    handleChange = (token) => {
        const { onChange } = this.props;
        if (onChange) {
            onChange(token);
        }
    }

    expiredCallback = () => {
        // Clear old values
        this.handleChange('');

        const { expiredCallback } = this.props;
        if (expiredCallback) {
            expiredCallback();
        }
    }

    reset = () => {
        if (ReCaptcha.isReady() && this.widget !== null) {
            window.grecaptcha.reset(this.widget);
        }
        // Clear old values
        this.handleChange('');
    }

    renderGrecaptcha = () => {
        const {
            onloadCallback,
            siteKey,
            theme, size, tabindex, type, hl, badge,
        } = this.props;

        this.widget = window.grecaptcha.render(this.recaptchaDom, {
            sitekey: siteKey,
            callback: this.handleChange,
            theme,
            type,
            size,
            tabindex,
            hl,
            badge,
            'expired-callback': this.expiredCallback,
        });

        if (onloadCallback) {
            onloadCallback();
        }
    }

    renderError = () => {
        const {
            showHintAndError,
            error,
        } = this.props;

        if (!showHintAndError) {
            return null;
        }

        if (error) {
            return (
                <p
                    className={styles.error}
                    key="error"
                >
                    {error}
                </p>
            );
        }

        return (
            <p
                className={`${styles.empty} ${styles.error}`}
                key="empty"
            >
                -
            </p>
        );
    }

    render() {
        const {
            className,
            showHintAndError,
            error,
        } = this.props;

        const Error = this.renderError;

        const { ready } = this.state;

        const containerStyle = `${styles.recaptcha} ${className}`;
        const reCaptchaStyle = `${styles.gRecaptcha} ${(showHintAndError && error) ? styles.errored : ''}`;

        return (
            <div className={containerStyle}>
                <div
                    ref={(recaptchaDom) => { this.recaptchaDom = recaptchaDom; }}
                    className={reCaptchaStyle}
                >
                    { !ready && 'Loading...' }
                </div>
                <Error />
            </div>
        );
    }
}

export default FaramElement('input')(ReCaptcha);
