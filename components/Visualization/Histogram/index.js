import React, {
    PureComponent,
    Fragment,
} from 'react';
import { select } from 'd3-selection';
import {
    extent,
    max,
    histogram,
} from 'd3-array';
import { scaleLinear } from 'd3-scale';
import { timeFormat } from 'd3-time-format';
import {
    axisBottom,
    axisLeft,
} from 'd3-axis';

import PropTypes from 'prop-types';

import styles from './styles.scss';

import Responsive from '../../General/Responsive';
import Float from '../../View/Float';

const propTypes = {
    data: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    boundingClientRect: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }).isRequired,
    showAxis: PropTypes.bool,
    margins: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
    }),
};

const defaultProps = {
    showAxis: true,
    margins: {
        top: 10,
        right: 20,
        bottom: 30,
        left: 30,
    },
};

class Histogram extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    componentDidMount() {
        this.drawChart();
    }

    componentDidUpdate() {
        this.redrawChart();
    }

    drawChart = () => {
        const {
            data,
            boundingClientRect,
            margins,
            showAxis,
        } = this.props;

        if (!boundingClientRect.width || !data || data.length === 0) {
            return;
        }

        const { width: fullWidth, height: fullHeight } = boundingClientRect;
        const {
            left = 0,
            top = 0,
            right = 0,
            bottom = 0,
        } = margins;

        const width = fullWidth - left - right;
        const height = fullHeight - top - bottom;

        if (width < 0 || height < 0) {
            return;
        }

        const x = scaleLinear()
            .domain(extent(data)).nice()
            .rangeRound([0, width]);

        const bins = histogram()
            .domain(x.domain())
            .thresholds(x.ticks(40))(data);

        const y = scaleLinear()
            .domain([0, max(bins, d => d.length)]).nice()
            .range([height, 0]);

        const group = select(this.svg)
            .append('g')
            .attr('transform', `translate(${left}, ${top})`);

        group
            .selectAll('.bar')
            .data(bins)
            .enter()
            .append('g')
            .attr('class', `bar ${styles.bar}`)
            .append('rect')
            .attr('x', d => x(d.x0) + 1)
            .attr('width', d => Math.max(0, x(d.x1) - x(d.x0) - 1))
            .attr('y', d => y(d.length))
            .attr('height', d => y(0) - y(d.length));

        if (showAxis) {
            group
                .append('g')
                .attr('class', `xaxis ${styles.xaxis}`)
                .attr('transform', `translate(0, ${height})`)
                .call(axisBottom(x).tickFormat(timeFormat('%m/%d')));

            group
                .append('g')
                .attr('class', `yaxis ${styles.yaxis}`)
                .call(axisLeft(y));
        }
    };

    redrawChart = () => {
        const svg = select(this.svg);
        svg.selectAll('*').remove();
        this.drawChart();
    };

    render() {
        const { className: classNameFromProps } = this.props;

        const className = [
            'histogram',
            styles.histogram,
            classNameFromProps,
        ].join(' ');

        const tooltipClassName = [
            'tooltip',
            styles.tooltip,
        ].join(' ');

        return (
            <Fragment>
                <svg
                    className={className}
                    ref={(elem) => { this.svg = elem; }}
                />
                <Float>
                    <div
                        ref={(el) => { this.tooltip = el; }}
                        className={tooltipClassName}
                    />
                </Float>
            </Fragment>
        );
    }
}

export default Responsive(Histogram);
