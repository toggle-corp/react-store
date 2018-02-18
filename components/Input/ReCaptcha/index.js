import React, { Component } from 'react';
import PropTypes from 'prop-types';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    siteKey: PropTypes.string.isRequired,
    reset: PropTypes.bool,

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
    reset: false,
    theme: 'light',
    type: 'image',
    size: 'normal',
    tabindex: '0',
    hl: 'en',
    badge: 'bottomright',

    showHintAndError: true,
    error: '',
};

export default class ReCaptcha extends Component {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            ready: this.isReady(),
        };

        if (!this.state.ready) {
            this.readyCheck = setInterval(this.updateReadyState, 1000);
        }
    }

    componentDidMount() {
        if (this.state.ready) {
            this.renderGrecaptcha();
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.ready && !prevState.ready) {
            this.renderGrecaptcha();
        } else if (this.props.reset && !prevProps.reset) {
            this.reset();
        }
    }

    componentWillUnmount() {
        clearInterval(this.readyCheck);
    }

    onChange = (token) => {
        const { onChange } = this.props;
        if (onChange) {
            onChange(token);
        }
    }

    expiredCallback = () => {
        const { expiredCallback } = this.props;
        if (expiredCallback) {
            expiredCallback();
        } else {
            this.onChange('');
        }
    }

    isReady = () => (window.grecaptcha !== undefined)

    reset = () => {
        const { ready } = this.state;
        if (ready && this.widget !== null) {
            window.grecaptcha.reset(this.widget);
            this.onChange('');
        }
    }

    updateReadyState = () => {
        if (this.isReady()) {
            this.setState({
                ready: true,
            });
            clearInterval(this.readyCheck);
        }
    }

    renderGrecaptcha = () => {
        const {
            onloadCallback,
            siteKey,
            theme, size, tabindex, type, hl, badge,
        } = this.props;

        this.widget = window.grecaptcha.render(this.recaptchaDom, {
            sitekey: siteKey,
            callback: this.onChange,
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

    render() {
        const {
            className,
            showHintAndError,
            error,
        } = this.props;

        const { ready } = this.state;

        const containerStyle = `${styles.recaptcha} ${className}`;
        const reCaptchaStyle = `${styles['g-recaptcha']} ${(showHintAndError && error) ? styles.error : ''}`;

        return (
            <div className={containerStyle}>
                <div
                    ref={(recaptchaDom) => { this.recaptchaDom = recaptchaDom; }}
                    className={reCaptchaStyle}
                >
                    { !ready && 'Loading....' }
                </div>
                {
                    (showHintAndError && error) && (
                        <p
                            className={styles.error}
                        >
                            {error}
                        </p>
                    )
                }
            </div>
        );
    }
}
