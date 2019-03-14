import PropTypes from 'prop-types';
import React from 'react';

import ListView from '#rscv/List/ListView';

import LegendItem from './LegendItem';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    itemClassName: PropTypes.string,
};

const defaultProps = {
    className: '',
    itemClassName: '',
};

export default class Legend extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    legendItemRendererParams = (_, d) => {
        const {
            labelSelector,
            colorSelector,
            itemClassName,
        } = this.props;

        return ({
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
        } = this.props;

        return (
            <ListView
                data={data}
                className={className}
                renderer={LegendItem}
                keySelector={keySelector}
                rendererParams={this.legendItemRendererParams}
            />
        );
    }
}
