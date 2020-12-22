import React, { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { FaramInputElement } from '@togglecorp/faram';
import { _cs } from '@togglecorp/fujs';

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

    // eslint-disable-next-line react/forbid-prop-types
    componentRef: PropTypes.object,
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

    componentRef: undefined,
};

const isReady = () => (window.grecaptcha && window.grecaptcha.render);

function ReCaptcha(props) {
    const {
        className,
        showHintAndError,
        error,

        expiredCallback,
        onChange,
        onloadCallback,
        siteKey,
        theme,
        size,
        tabindex,
        type,
        hl,
        badge,
        componentRef,
    } = props;

    const [ready, setReady] = useState(isReady);
    const reCaptchaDom = useRef();
    const widgetRef = useRef();

    const containerStyle = _cs(styles.recaptcha, className);
    const reCaptchaStyle = _cs(styles.gRecaptcha, showHintAndError && error && styles.errored);

    useEffect(
        () => {
            if (ready) {
                return () => {};
            }
            const timer = setInterval(
                () => {
                    const r = isReady();
                    if (r) {
                        setReady(r);
                    }
                },
                1000,
            );
            return () => {
                clearTimeout(timer);
            };
        },
        [ready],
    );

    useEffect(
        () => {
            if (!ready) {
                return;
            }

            widgetRef.current = window.grecaptcha.render(reCaptchaDom.current, {
                sitekey: siteKey,
                callback: (token) => {
                    if (onChange) {
                        onChange(token);
                    }
                },
                theme,
                type,
                size,
                tabindex,
                hl,
                badge,
                'expired-callback': () => {
                    if (onChange) {
                        onChange('');
                    }
                    if (expiredCallback) {
                        expiredCallback();
                    }
                },
            });

            if (onloadCallback) {
                onloadCallback();
            }
        },
        [
            ready,
            siteKey, theme, size, tabindex, type, hl, badge,
            onloadCallback, onChange, expiredCallback,
        ],
    );

    const handleReset = useCallback(
        () => {
            if (ready && widgetRef.current !== null) {
                window.grecaptcha.reset(widgetRef.current);
            }
            if (onChange) {
                onChange('');
            }
        },
        [onChange, ready],
    );
    useEffect(
        () => {
            componentRef.current = {
                reset: handleReset,
            };
        },
        [handleReset, componentRef],
    );

    let errorComp;
    if (showHintAndError) {
        if (error) {
            errorComp = (
                <p
                    className={styles.error}
                    key="error"
                >
                    {error}
                </p>
            );
        } else {
            errorComp = (
                <p
                    className={`${styles.empty} ${styles.error}`}
                    key="empty"
                >
                    -
                </p>
            );
        }
    }

    return (
        <div className={containerStyle}>
            <div
                ref={reCaptchaDom}
                className={reCaptchaStyle}
            >
                { !ready && 'Loading...' }
            </div>
            {errorComp}
        </div>
    );
}
ReCaptcha.propTypes = propTypes;
ReCaptcha.defaultProps = defaultProps;

export default FaramInputElement(ReCaptcha);
