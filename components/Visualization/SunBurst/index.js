import React, {
    PureComponent,
    Fragment,
} from 'react';
import { select, event } from 'd3-selection';
import { hierarchy, partition } from 'd3-hierarchy';
import { arc } from 'd3-shape';
import { interpolateArray } from 'd3-interpolate';
import { scaleLinear, scaleOrdinal } from 'd3-scale';
import { transition } from 'd3-transition';
import { PropTypes } from 'prop-types';
import { schemePaired } from 'd3-scale-chromatic';
import SvgSaver from 'svgsaver';
import Responsive from '../../General/Responsive';
import {
    getStandardFilename,
    getColorOnBgColor,
    isObjectEmpty,
} from '../../../utils/common';
import Float from '../../View/Float';

import styles from './styles.scss';

/**
 * boundingClientRect: the width and height of the container.
 * data: the hierarchical data to be visualized.
 * childrenAccessor: the accessor function to return array of data representing the children.
 * labelAccessor: returns the individual label from a unit data.
 * valueAccessor: return the value for the unit data.
 * colorScheme: array of hex color values.
 * showLabels: show labels on the diagram?
 * showTooltip: show the tooltip?
 * className: additional class name for styling.
 * margins: the margin object with properties for the four sides(clockwise from top).
 */
const propTypes = {
    boundingClientRect: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }).isRequired,
    data: PropTypes.shape({
        name: PropTypes.string,
    }).isRequired,
    childrenAccessor: PropTypes.func,
    labelAccessor: PropTypes.func.isRequired,
    valueAccessor: PropTypes.func.isRequired,
    colorScheme: PropTypes.arrayOf(PropTypes.string),
    showLabels: PropTypes.bool,
    showTooltip: PropTypes.bool,
    className: PropTypes.string,
    margins: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
    }),
};

const defaultProps = {
    childrenAccessor: d => d.children,
    colorScheme: schemePaired,
    showLabels: true,
    showTooltip: true,
    className: '',
    margins: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    },
};

const twoPi = 2 * Math.PI;
const tooltipOffset = { x: 10, y: 10 };
const transitionDuration = 750;

/*
 * Sunburst is a multilevel pie chart used to represent proportion of values found at each level
 * in hierarchy.
 * */

class SunBurst extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.scaleX = scaleLinear()
            .range([0, twoPi]);
    }

    componentDidMount() {
        this.renderChart();
    }

    componentDidUpdate() {
        this.renderChart();
    }

    save = () => {
        const svg = select(this.svg);
        const svgsaver = new SvgSaver();
        svgsaver.asSvg(svg.node(), `${getStandardFilename('sunburst', 'graph')}.svg`);
    }

    calculateBounds = () => {
        const {
            margins,
            boundingClientRect,
        } = this.props;

        const {
            width,
            height,
        } = boundingClientRect;

        const {
            top,
            right,
            bottom,
            left,
        } = margins;

        this.width = width - left - right;
        this.height = height - top - bottom;

        this.svgGroupTransformation = `translate(
            ${(this.width) / 2},
            ${(this.height) / 2}
        )`;
    }

    calculateLabelTransformation = (t) => {
        const st = this.arch.startAngle()(t);
        const ed = this.arch.endAngle()(t);
        const angle = Math.round(Math.abs(st - ed)).toFixed(2);
        const twoPI = Math.round(twoPi).toFixed(2);

        if (t.parent === null) {
            return 'translate(0, 0)';
        }

        const { centroid } = this.arch;

        if (angle >= twoPI) {
            return `translate(${centroid(t)})`;
        }

        return `
            translate(${centroid(t)})
            rotate(${this.calculateTextRotation(t)})
        `;
    }

    calculateTextRotation = (d) => {
        const angle = ((this.scaleX((d.x0 + d.x1) / 2)
            - (Math.PI / 2)) / Math.PI) * 180;

        return (angle > 90) ? 180 + angle : angle;
    };

    init = () => {
        const { colorScheme } = this.props;

        this.calculateBounds();

        this.radius = Math.min(this.width, this.height) / 2;
        this.scaleY = scaleLinear()
            .range([0, this.radius]);

        this.color = scaleOrdinal()
            .range(colorScheme);

        this.arch = arc()
            .startAngle(d => Math.max(0, Math.min(twoPi, this.scaleX(d.x0))))
            .endAngle(d => Math.max(0, Math.min(twoPi, this.scaleX(d.x1))))
            .innerRadius(d => Math.max(0, this.scaleY(d.y0)))
            .outerRadius(d => Math.max(0, this.scaleY(d.y1)));
    }

    clearNodes = (svg) => {
        svg.selectAll('*')
            .remove();
    }

    handleArcMouseOver = (d) => {
        const { labelAccessor } = this.props;
        const label = labelAccessor(d.data) || '';

        this.tooltip.innerHTML = `
            <span class="${styles.label}">
                ${label}
            </span>
            <span class="${styles.value}">
                ${d.value}
            </span>
        `;

        const { style } = this.tooltip;
        style.display = 'block';
    }

    handleArcMouseMove = () => {
        const { style } = this.tooltip;
        style.top = `${event.pageY + tooltipOffset.y}px`;
        style.left = `${event.pageX + tooltipOffset.x}px`;
    }

    handleArcMouseOut = () => {
        const { style } = this.tooltip;
        style.display = 'none';
    }

    handleSliceClick = (selection, node) => {
        selection
            .selectAll('text')
            .transition()
            .attr('opacity', 0);

        const tran = transition()
            .duration(transitionDuration);

        selection
            .transition(tran)
            .tween('scale', () => {
                const xd = interpolateArray(this.scaleX.domain(), [node.x0, node.x1]);
                const yd = interpolateArray(this.scaleY.domain(), [node.y0, 1]);
                const yr = interpolateArray(this.scaleY.range(), [node.y0 ? 20 : 0, this.radius]);

                return (t) => {
                    this.scaleX.domain(xd(t));
                    this.scaleY.domain(yd(t))
                        .range(yr(t));
                };
            })
            .selectAll('path')
            .attrTween('d', t => () => this.arch(t))
            .on('end', (e, dummy, nodes) => {
                this.renderText(node, e, nodes[0]);
            });
    }

    filterText = (e, currentText) => {
        const textLength = currentText.getComputedTextLength();
        const textWidth = select(currentText).node().getBBox().height;

        const innerRadius = this.arch.innerRadius()(e);
        const outerRadius = this.arch.outerRadius()(e);
        const arcWidth = outerRadius - innerRadius;
        const angle = this.arch.endAngle()(e)
            - this.arch.startAngle()(e);
        const arcLength = angle * innerRadius;
        return (arcWidth <= textLength || arcLength <= textWidth);
    }

    renderText = (node, e, currentNode) => {
        if (e.x0 >= node.x0 && e.x1 <= node.x1) {
            const text = select(currentNode.parentNode)
                .select('text');

            text.transition()
                .duration(transitionDuration)
                .attr('opacity', 1)
                .attr('transform', this.calculateLabelTransformation)
                .filter((e1, i, textNodes) => (
                    this.filterText(e1, textNodes[i])
                ))
                .attr('opacity', 0);
        }
    }

    renderChart = () => {
        const {
            boundingClientRect,
            data,
            childrenAccessor,
            labelAccessor,
            valueAccessor,
            showLabels,
            showTooltip,
        } = this.props;

        if (!boundingClientRect.width || isObjectEmpty(data)) {
            return;
        }

        this.init();

        const {
            width,
            height,
        } = boundingClientRect;

        const svg = select(this.svg);

        this.clearNodes(svg);
        // this.tooltip = this.createTooltip(container);

        const group = svg.attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', this.svgGroupTransformation);

        const root = hierarchy(data, childrenAccessor)
            .sum(d => valueAccessor(d));
        const partitions = partition()(root);
        const slicesData = partitions.descendants();

        const slices = group
            .selectAll('g')
            .data(slicesData)
            .enter()
            .append('g');

        const arcs = slices
            .append('path')
            .attr('class', 'arcs')
            .attr('d', this.arch)
            .style('stroke-width', d => d.height + 2)
            .style('stroke', 'white')
            .style('fill', d => this.color(labelAccessor(d.children ? d.data : d.parent.data)))
            .on('click', d => this.handleSliceClick(slices, d));

        if (showTooltip) {
            arcs.on('mouseover', this.handleArcMouseOver)
                .on('mousemove', this.handleArcMouseMove)
                .on('mouseout', this.handleArcMouseOut);
        }

        if (showLabels) {
            const labels = slices
                .append('text')
                .attr('class', 'labels')
                .attr('transform', this.calculateLabelTransformation)
                .attr('pointer-events', 'none')
                .attr('text-anchor', 'middle')
                .text(d => labelAccessor(d.data))
                .style('fill', (d) => {
                    const colorBg = this.color(labelAccessor(d.children ? d.data : d.parent.data));
                    return getColorOnBgColor(colorBg);
                });

            labels.filter((e, i, textNodes) => (
                this.filterText(e, textNodes[i])
            )).attr('opacity', 0);
        }
    }

    render() {
        const { className } = this.props;
        const svgClassName = [
            'sunburst',
            styles.sunburst,
            className,
        ].join(' ');

        const tooltipClassName = [
            'sunburst-tooltip',
            styles.sunburstTooltip,
        ].join(' ');

        return (
            <Fragment>
                <svg
                    ref={(elem) => { this.svg = elem; }}
                    className={svgClassName}
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

export default Responsive(SunBurst);
