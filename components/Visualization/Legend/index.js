import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';

import ListView from '#rscv/List/ListView';

import LegendItem from './LegendItem';
// import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    itemClassName: PropTypes.string,
    iconSelector: PropTypes.func,
    keySelector: PropTypes.func.isRequired,
    labelSelector: PropTypes.func.isRequired,
    colorSelector: PropTypes.func.isRequired,
    valueSelector: PropTypes.func,
    symbolClassNameSelector: PropTypes.func,
    data: PropTypes.array, // eslint-disable-next-line react/forbid-prop-types
};

const defaultProps = {
    className: '',
    itemClassName: '',
    iconSelector: () => undefined,
    valueSelector: undefined,
    symbolClassNameSelector: undefined,
    data: [],
};

export default class Legend extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

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
            symbolClassName: symbolClassNameSelector ?
                symbolClassNameSelector(d) : '',
        });
    }

    filterData = memoize((data, valueSelector) => (
        valueSelector
            ? data.filter(val => valueSelector(val) > 0)
            : data
    ))

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
