import PropTypes from 'prop-types';
import React from 'react';

import ListView from '#rscv/List/ListView';

import LegendItem from './LegendItem';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    itemClassName: PropTypes.string,
    iconSelector: PropTypes.func,
};

const defaultProps = {
    className: '',
    itemClassName: '',
    iconSelector: () => undefined,
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
        } = this.props;

        return ({
            icon: iconSelector(d),
            label: labelSelector(d),
            color: colorSelector(d),
            className: itemClassName,
        });
    }

    render() {
        const {
            data,
            className,
            keySelector,
            emptyComponent,
        } = this.props;

        return (
            <ListView
                data={data}
                className={className}
                renderer={LegendItem}
                keySelector={keySelector}
                rendererParams={this.legendItemRendererParams}
                emptyComponent={emptyComponent}
            />
        );
    }
}
