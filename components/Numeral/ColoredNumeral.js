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
};

const defaultProps = {
    className: '',
    value: undefined,
    referenceValue: undefined,
    referenceLine: undefined,
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
            referenceLine = 0,
            value,
            referenceValue = value,
            ...props
        } = this.props;

        const styleName = referenceValue - referenceLine >= 0 ? 'gain-positive' : 'gain-negative';

        return (
            <span
                className={className}
                styleName={styleName}
            >
                <Numeral
                    value={value}
                    {...props}
                />
            </span>
        );
    }
}
