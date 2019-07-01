import React, { PureComponent } from 'react';
import { select } from 'd3-selection';
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
import { _cs } from '@togglecorp/fujs';
import PropTypes from 'prop-types';

import Responsive from '../../General/Responsive';
import Float from '../../View/Float';

import { getStandardFilename } from '../../../utils/common';

import styles from './styles.scss';

const propTypes = {
    /**
     * Size of the parent element/component (passed by the Responsive hoc)
     */
    boundingClientRect: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }).isRequired,
    /**
     * Array of data elements each having a label and value
     */
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
    /**
     * Handle chart saving functionality
     */
    setSaveFunction: PropTypes.func,
    /**
     * Select the value of element
     */
    valueSelector: PropTypes.func.isRequired,
    /**
     * Select the label of element
     */
    labelSelector: PropTypes.func.isRequired,
    /**
     * Padding between two bars as proportion to bar width
     */
    bandPadding: PropTypes.number,
    /**
     * Select a color for each bar
     */
    colorSelector: PropTypes.func,
    /**
     * Handle mouseover over a bar
     */
    onBarMouseOver: PropTypes.func,
    /**
     * if true, show axis
     */
    showAxis: PropTypes.bool,
    /**
     * Array of colors as hex color codes
     */
    colorScheme: PropTypes.arrayOf(PropTypes.string),
    /**
     * if ture, tooltip is visible
     */
    showTooltip: PropTypes.bool,
    /**
     * Handle the contents of tooltip
     */
    tooltipContent: PropTypes.func,
    /**
     * Margins for the chart
     */
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

/**
 * VerticalBarChart represents categorical data with vertical bars. Height of each bar represent
 * the value of data element.
  */
class VerticalBarChart extends PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        if (props.setSaveFunction) {
            props.setSaveFunction(this.save);
        }

        this.svgRef = React.createRef();
        this.tooltipRef = React.createRef();
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
        const { current: svgElement } = this.svgRef;
        const svg = select(svgElement);
        svgsaver.asSvg(svg.node(), `${getStandardFilename('barchart', 'graph')}.svg`);
    }

    redrawChart = () => {
        const { current: svgElement } = this.svgRef;
        const svg = select(svgElement);

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
                     ${label || ''}
                </span>
                <span class="${styles.value}">
                     ${value || ''}
                </span>
            `;
            const content = tooltipContent ? tooltipContent(d) : defaultTooltip;
            const { current: tooltip } = this.tooltipRef;
            tooltip.innerHTML = content;
            const { style } = tooltip;
            style.display = 'block';
        }
    }

    handleMouseMove = () => {
        const { showTooltip } = this.props;

        if (showTooltip) {
            const { current: tooltip } = this.tooltipRef;
            const { style } = tooltip;
            const { width, height } = tooltip.getBoundingClientRect();
            // eslint-disable-next-line no-restricted-globals
            const x = event.pageX;

            // eslint-disable-next-line no-restricted-globals
            const y = event.pageY;

            const posX = x - (width / 2);
            const posY = y - (height + 10);

            style.top = `${posY}px`;
            style.left = `${posX}px`;
        }
    }

    handleMouseOut = () => {
        const {
            showTooltip,
        } = this.props;

        if (showTooltip) {
            const { current: tooltip } = this.tooltipRef;
            const { style } = tooltip;
            style.display = 'none';
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

        const { current: svgElement } = this.svgRef;
        svgElement.setAttribute('width', `${fullWidth}px`);
        svgElement.setAttribute('height', `${fullHeight}px`);

        const group = select(svgElement)
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
            .on('mouseover', d => this.handleMouseOver(d))
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

        const className = _cs(
            'vertical-bar-chart',
            styles.verticalBarChart,
            classNameFromProps,
        );

        const tooltipClassName = _cs(
            'tooltip',
            styles.tooltip,
        );

        const svgClassName = _cs(
            'svg',
            styles.svg,
        );

        return (
            <div className={className}>
                <svg
                    className={svgClassName}
                    ref={this.svgRef}
                />
                <Float>
                    <div
                        ref={this.tooltipRef}
                        className={tooltipClassName}
                    />
                </Float>
            </div>
        );
    }
}

export default Responsive(VerticalBarChart);
