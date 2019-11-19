import React, {
    PureComponent,
    Fragment,
} from 'react';
import {
    select,
    event,
} from 'd3-selection';
import { schemeSet3 } from 'd3-scale-chromatic';
import { max } from 'd3-array';
import SvgSaver from 'svgsaver';
import {
    scaleOrdinal,
    scaleBand,
    scaleLinear,
} from 'd3-scale';
import {
    axisLeft,
    axisBottom,
} from 'd3-axis';

import PropTypes from 'prop-types';

import Responsive from '../../General/Responsive';
import Float from '../../View/Float';

import { getStandardFilename } from '../../../utils/common';

import styles from './styles.scss';

const propTypes = {
    boundingClientRect: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }).isRequired,
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
    setSaveFunction: PropTypes.func,
    valueSelector: PropTypes.func.isRequired,
    labelSelector: PropTypes.func.isRequired,
    bandPadding: PropTypes.number,
    colorSelector: PropTypes.func,
    onBarMouseOver: PropTypes.func,
    showAxis: PropTypes.bool,
    colorScheme: PropTypes.arrayOf(PropTypes.string),
    showTooltip: PropTypes.bool,
    tooltipContent: PropTypes.func,
    margins: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
    }),
    className: PropTypes.string,
};

const defaultProps = {
    setSaveFunction: undefined,
    onBarMouseOver: undefined,
    colorSelector: undefined,
    bandPadding: 0.2,
    colorScheme: schemeSet3,
    showAxis: true,
    showTooltip: false,
    tooltipContent: undefined,
    margins: {
        top: 24,
        right: 24,
        bottom: 24,
        left: 72,
    },
    className: '',
};

class VerticalBarChart extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        if (props.setSaveFunction) {
            props.setSaveFunction(this.save);
        }
    }

    componentDidMount() {
        this.drawChart();
    }

    componentDidUpdate() {
        this.redrawChart();
    }

    getColor = (d) => {
        const {
            labelSelector,
            colorSelector,
        } = this.props;

        if (colorSelector) {
            return colorSelector(d);
        }

        return this.colors(labelSelector(d));
    }
    save = () => {
        const svgsaver = new SvgSaver();
        const svg = select(this.svg);
        svgsaver.asSvg(svg.node(), `${getStandardFilename('barchart', 'graph')}.svg`);
    }

    redrawChart = () => {
        const svg = select(this.svg);
        svg.selectAll('*').remove();
        this.drawChart();
    }

    handleMouseOver = (d) => {
        const {
            valueSelector,
            labelSelector,
            showTooltip,
            tooltipContent,
            onBarMouseOver,
        } = this.props;

        if (onBarMouseOver) {
            onBarMouseOver(d);
        }

        if (showTooltip) {
            const value = valueSelector(d);
            const label = labelSelector(d);

            const defaultTooltip = `
            <span class="${styles.label}">
                 ${label}
            </span>
            <span class="${styles.value}">
                 ${value}
            </span>`;
            const content = tooltipContent ? tooltipContent(d) : defaultTooltip;

            select(this.tooltip)
                .html(content)
                .style('display', 'inline-block');
        }
    }

    handleMouseMove = () => {
        const {
            showTooltip,
        } = this.props;

        if (showTooltip) {
            const { width, height } = this.tooltip.getBoundingClientRect();

            select(this.tooltip)
                .style('top', `${event.pageY - height - (height / 2)}px`)
                .style('left', `${event.pageX - (width / 2)}px`);
        }
    }

    handleMouseOut = () => {
        const {
            showTooltip,
        } = this.props;

        if (showTooltip) {
            select(this.tooltip)
                .style('display', 'none');
        }
    }

    drawChart = () => {
        const {
            data,
            boundingClientRect,
            valueSelector,
            labelSelector,
            bandPadding,
            margins,
            showAxis,
            colorScheme,
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

        this.colors = scaleOrdinal().range(colorScheme);

        const group = select(this.svg)
            .append('g')
            .attr('transform', `translate(${left}, ${top})`);

        const x = scaleBand()
            .domain(data.map(d => labelSelector(d)))
            .rangeRound([0, width])
            .padding(bandPadding);

        const y = scaleLinear()
            .domain([0, max(data, valueSelector)])
            .range([height, 0])
            .clamp(true);

        group
            .selectAll('.bar')
            .data(data)
            .enter()
            .append('rect')
            .attr('class', `bar ${styles.bar}`)
            .attr('x', d => x(labelSelector(d)))
            .attr('y', d => y(valueSelector(d)))
            .attr('width', x.bandwidth())
            .attr('height', d => height - y(valueSelector(d)))
            .style('fill', d => this.getColor(d))
            .on('mouseover', this.handleMouseOver)
            .on('mousemove', this.handleMouseMove)
            .on('mouseout', this.handleMouseOut);

        if (showAxis) {
            const xAxis = axisBottom(x);
            const yAxis = axisLeft(y);

            group
                .append('g')
                .attr('class', `xaxis ${styles.xaxis}`)
                .attr('transform', `translate(0, ${height})`)
                .call(xAxis);

            group
                .append('g')
                .attr('class', `yaxis ${styles.yaxis}`)
                .call(yAxis);
        }
    }

    render() {
        const { className: classNameFromProps } = this.props;

        const className = [
            'vertical-bar-chart',
            styles.barChart,
            classNameFromProps,
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
                        className={styles.tooltip}
                    />
                </Float>
            </Fragment>
        );
    }
}

export default Responsive(VerticalBarChart);
