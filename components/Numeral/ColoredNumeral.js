import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import styles from './styles.scss';

import Numeral from './Numeral';

const propTypes = {
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
            value,
            referenceValue = value,
            referenceLine = 0,
            ...props
        } = this.props;

        const styleName = referenceValue - referenceLine >= 0 ? 'gain-positive' : 'gain-negative';

        return (
            <span styleName={styleName} >
                <Numeral
                    value={value}
                    {...props}
                />
            </span>
        );
    }
}
