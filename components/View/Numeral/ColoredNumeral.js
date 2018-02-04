import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import styles from './styles.scss';

import Numeral from './Numeral';

const propTypes = {
    /**
     * reqired for style override
     */
    className: PropTypes.string,

    /**
     * The label of the numeral
     */
    label: PropTypes.string,
    /**
     * show in block
     */
    inBlock: PropTypes.string,
    /**
     * The value of the numeral
     */
    value: PropTypes.number,
    /**
     * The value which is compared with referenceLine to identify color
     * Generally referenceValue is equal to value
     */
    referenceValue: PropTypes.number,
    /**
     * The value which sets the baseline for comparision. referenceValue
     * below referenceLine shows a negative color.
     */
    referenceLine: PropTypes.number,
    /**
     * to generate className
     */
    modifier: PropTypes.func,
};

const defaultProps = {
    className: '',
    label: undefined,
    value: undefined,
    referenceValue: undefined,
    referenceLine: undefined,
    modifier: undefined,
    inBlock: false,
};

/**
 * Numeral component for formatted numbers with conditional coloring
 */
@CSSModules(styles, { allowMultiple: true })
export default class ColoredNumeral extends React.PureComponent {
    static defaultProps = defaultProps;
    static propTypes = propTypes;

    render() {
        const {
            className,
            label,
            referenceLine = 0,
            value,
            referenceValue = value,
            modifier,
            inBlock,
            ...props
        } = this.props;

        const defaultStyle = inBlock ? 'block-numeral' : 'colored-numeral';

        let colorClass = '';
        let styleName = '';

        if (modifier) {
            colorClass = modifier(referenceLine, value, referenceValue);
        } else {
            styleName = referenceValue - referenceLine >= 0 ? 'gain-positive' : 'gain-negative';
        }

        return (
            <span
                className={`${defaultStyle} ${className} ${colorClass}`}
                styleName={`${defaultStyle} ${styleName}`}
            >
                {
                    label && (
                        <div
                            className="label"
                        >
                            { label }
                        </div>
                    )
                }
                <Numeral
                    value={value}
                    {...props}
                />
            </span>
        );
    }
}
