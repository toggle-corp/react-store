import PropTypes from 'prop-types';
import React from 'react';
import {
    addSeparator,
    isFalsy,
    isTruthy,
    formattedNormalize,
} from '@togglecorp/fujs';
import { FaramOutputElement } from '@togglecorp/faram';

import styles from './styles.scss';


const propTypes = {
    /**
     * reqired for style override
     */
    className: PropTypes.string,
    /**
     * string to show, if value is unexpected
     * Default: -
     */
    invalidText: PropTypes.string,
    /**
     * Normalize numer into Lac, Cr, Ar
     */
    normal: PropTypes.bool,
    /**
     * Numer of digits after decimal point. Rounding is also applied.
     */
    precision: PropTypes.number,
    /**
     * Prefix the output with certain string. Eg. $
     */
    prefix: PropTypes.string,
    /**
     * Specify which separator to use for thousands
     */
    separator: PropTypes.string,
    /**
     * Show or hide thousands separator
     */
    showSeparator: PropTypes.bool,
    /**
     * Show both positive and negative sign for number
     */
    showSign: PropTypes.bool,
    /**
     * Prefix the output with certain string. Eg. %
     */
    suffix: PropTypes.string,
    /**
     * The value of the numeral
     */
    value: PropTypes.number,

    lang: PropTypes.string,
};

const defaultProps = {
    className: '',
    invalidText: '-',
    normal: false,
    precision: 2,
    prefix: undefined,
    separator: undefined,
    showSeparator: true,
    showSign: false,
    suffix: undefined,
    value: undefined,
    lang: undefined,
};


/**
 * Numeral component for formatted numbers
 */
class Numeral extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    static getNormalizedNumber({
        value,
        showSign = false,
        normal = false,
        precision = undefined,
        showSeparator = true,
        separator = ',',
        lang = 'en',
    }) {
        // Only use absolute part if showSign is true (sign are added later)
        let number = isTruthy(showSign) ? Math.abs(value) : value;

        // Get normalize-suffix and reduce the number
        let normalizeSuffix;

        if (normal) {
            const { number: num, normalizeSuffix: norm } = formattedNormalize(number, lang);
            number = num;
            normalizeSuffix = norm;
        }

        // Convert number to fixed precision
        if (isTruthy(precision)) {
            number = number.toFixed(precision);
        }

        // Convert number to add separator
        if (showSeparator) {
            number = addSeparator(number, separator);
        }

        return { number, normalizeSuffix };
    }

    static renderText(props) {
        const {
            normal,
            precision,
            prefix = '',
            separator,
            showSeparator,
            showSign,
            suffix = '',
            value,
            invalidText,
            lang,
        } = { ...defaultProps, ...props };

        if (isFalsy(value)) {
            return invalidText;
        }

        const { number, normalizeSuffix = '' } = Numeral.getNormalizedNumber({
            value, showSign, normal, precision, showSeparator, separator, lang,
        });

        return `${prefix}${number}${normalizeSuffix}${suffix}`;
    }

    render() {
        const {
            className,
            normal,
            precision,
            prefix,
            separator,
            showSeparator,
            showSign,
            suffix,
            value,
            lang,
            invalidText,
        } = this.props;

        if (isFalsy(value)) {
            return (
                <span
                    className={className}
                >
                    {invalidText}
                </span>
            );
        }

        const { number, normalizeSuffix } = Numeral.getNormalizedNumber({
            value, showSign, normal, precision, showSeparator, separator, lang,
        });

        return (
            <span className={`numeral ${className} ${styles.numeral}`}>
                {
                    isTruthy(prefix) && (
                        <span className="prefix">
                            {prefix}
                        </span>
                    )
                }
                {
                    isTruthy(showSign) && value !== 0 && (
                        <span className="sign">
                            {value > 0 ? '+' : '-'}
                        </span>
                    )
                }
                <span className="number">
                    {number}
                </span>
                {
                    isTruthy(normalizeSuffix) && (
                        <span className="normalized-suffix">
                            {normalizeSuffix}
                        </span>
                    )
                }
                {
                    isTruthy(suffix) && (
                        <span className="suffix">
                            {suffix}
                        </span>
                    )
                }
            </span>
        );
    }
}

export default FaramOutputElement(Numeral);
