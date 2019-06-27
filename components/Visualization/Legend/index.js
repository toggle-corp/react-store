import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';

import ListView from '#rscv/List/ListView';

import LegendItem from './LegendItem';
// import styles from './styles.scss';

const propTypes = {
    /**
     * Additional css classes passed from parent
     */
    className: PropTypes.string,
    /**
     * styles for each item
     */
    itemClassName: PropTypes.string,
    /**
     * Select an icon for each item
     */
    iconSelector: PropTypes.func,
    /**
     * Select a key for each item
     */
    keySelector: PropTypes.func.isRequired,
    /**
     * Select a label for each item
     */
    labelSelector: PropTypes.func.isRequired,
    /**
     * Select a color for each item
     */
    colorSelector: PropTypes.func.isRequired,
    /**
     * Select a value for each item
     */
    valueSelector: PropTypes.func,
    /**
     * Component to show when data is empty
    */
    emptyComponent: PropTypes.func,
    /**
     * Select a className for each symbol
     */
    symbolClassNameSelector: PropTypes.func,
    /**
     * Array of items that represents a legend
     * example: [{ id: 1, color: #ff00ff, label: 'apple'},.. ],
     */
    data: PropTypes.array, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: '',
    itemClassName: '',
    iconSelector: () => undefined,
    valueSelector: undefined,
    symbolClassNameSelector: undefined,
    emptyComponent: undefined,
    data: [],
};

/**
 * Generates a legend based on provided data.
 */
export default class Legend extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    filterData = memoize((data, valueSelector) => (
        valueSelector
            ? data.filter(val => valueSelector(val) > 0)
            : data
    ))

    legendItemRendererParams = (_, d) => {
        const {
            iconSelector,
            labelSelector,
            colorSelector,
            itemClassName,
            symbolClassNameSelector,
        } = this.props;

        return ({
            icon: iconSelector(d),
            label: labelSelector(d),
            color: colorSelector(d),
            className: itemClassName,
            symbolClassName: symbolClassNameSelector ? symbolClassNameSelector(d) : '',
        });
    }

    render() {
        const {
            data,
            className,
            keySelector,
            emptyComponent,
            valueSelector,
        } = this.props;

        const filteredData = this.filterData(data, valueSelector);

        return (
            <ListView
                data={filteredData}
                className={className}
                renderer={LegendItem}
                keySelector={keySelector}
                rendererParams={this.legendItemRendererParams}
                emptyComponent={emptyComponent}
            />
        );
    }
}
