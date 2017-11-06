import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import Numeral from './Numeral';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,

    /**
     * The label of the numeral
     */
    label: PropTypes.string,
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
    label: undefined,
    value: undefined,
    referenceValue: undefined,
    referenceLine: undefined,
};


/**
 * Block component for formatted numbers with conditional coloring and provided label
 */
@CSSModules(styles, { allowMultiple: true })
export default class BlockNumeral extends React.PureComponent {
    static defaultProps = defaultProps;
    static propTypes = propTypes;

    render() {
        const {
            className,
            label,
            value,
            referenceLine = 0,
            referenceValue = value,
            ...props
        } = this.props;

        const styleName = referenceValue - referenceLine >= 0 ? 'gain-positive' : 'gain-negative';

        return (
            <div
                className={`block-numeral ${className}`}
                styleName={`block-numeral ${styleName}`}
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
            </div>
        );
    }
}
