import React, {
    PureComponent,
    Fragment,
} from 'react';
import { select, event } from 'd3-selection';
import { hierarchy, partition } from 'd3-hierarchy';
import { arc } from 'd3-shape';
import { interpolateArray } from 'd3-interpolate';
import { scaleLinear, scaleOrdinal } from 'd3-scale';
import { PropTypes } from 'prop-types';
import { schemePaired } from 'd3-scale-chromatic';
import { path } from 'd3-path';
import SvgSaver from 'svgsaver';
import Responsive from '../../General/Responsive';
import {
    getStandardFilename,
    getColorOnBgColor,
    isObjectEmpty,
} from '../../../utils/common';
import Float from '../../View/Float';

import styles from './styles.scss';

const propTypes = {
    boundingClientRect: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }).isRequired,
    data: PropTypes.shape({
        name: PropTypes.string,
    }).isRequired,
    setSaveFunction: PropTypes.func,
    childrenSelector: PropTypes.func,
    labelSelector: PropTypes.func.isRequired,
    labelModifier: PropTypes.func,
    colorSelector: PropTypes.func,
    valueSelector: PropTypes.func.isRequired,
    colorScheme: PropTypes.arrayOf(PropTypes.string),
    className: PropTypes.string,
    margins: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
    }),
};

const defaultProps = {
    setSaveFunction: () => {},
    childrenSelector: d => d.children,
    colorScheme: schemePaired,
    colorSelector: undefined,
    labelModifier: d => d,
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

class SunBurst extends PureComponent {
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
        return this.colors(labelSelector(d.children ? d.data : d.parent.data));
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

    init = () => {
        const { colorScheme } = this.props;

        this.calculateBounds();

        this.radius = Math.min(this.width, this.height) / 2;

        this.x = scaleLinear()
            .range([0, twoPi])
            .clamp(true);

        this.y = scaleLinear()
            .range([0, this.radius]);

        this.colors = scaleOrdinal()
            .range(colorScheme);

        this.arch = arc()
            .startAngle(d => this.x(d.x0))
            .endAngle(d => this.x(d.x1))
            .innerRadius(d => Math.max(0, this.y(d.y0)))
            .outerRadius(d => Math.max(0, this.y(d.y1)));
    }

    middleArcLine = (d) => {
        const halfPi = Math.PI / 2;
        const angles = [this.x(d.x0) - halfPi, this.x(d.x1) - halfPi];
        const r = Math.max(0, (this.y(d.y0) + this.y(d.y1)) / 2);

        const middleAngle = (angles[1] + angles[0]) / 2;
        const invertDirection = middleAngle > 0 && middleAngle < Math.PI;
        if (invertDirection) { angles.reverse(); }

        const paths = path();
        paths.arc(0, 0, r, angles[0], angles[1], invertDirection);
        return paths.toString();
    }

    filterText = (d) => {
        const CHAR_SPACE = 6;

        const deltaAngle = this.x(d.x1) - this.x(d.x0);
        const r = Math.max(0, (this.y(d.y0) + this.y(d.y1)) / 2);
        const perimeter = r * deltaAngle;

        return d.data.name.length * CHAR_SPACE < perimeter;
    }

    handleClick = (d = { x0: 0, x1: 1, y0: 0, y1: 1 }) => {
        const transitions = select(this.svg)
            .transition()
            .duration(750)
            .tween('scale', () => {
                const xd = interpolateArray(this.x.domain(), [d.x0, d.x1]);
                const yd = interpolateArray(this.y.domain(), [d.y0, 1]);
                const yr = interpolateArray(this.y.range(), [d.y0 ? 20 : 0, this.radius]);
                return (t) => { this.x.domain(xd(t)); this.y.domain(yd(t)).range(yr(t)); };
            });

        transitions
            .selectAll('path.main-arc')
            .attrTween('d', t => () => this.arch(t));

        transitions
            .selectAll('path.hidden-arc')
            .attrTween('d', t => () => this.middleArcLine(t));

        transitions
            .selectAll('text')
            .attrTween('display', t => () => (this.filterText(t) ? null : 'none'));
    }

    handleArcMouseOver = (d) => {
        const { labelModifier } = this.props;
        const label = labelModifier(d) || '';

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

        const { width, height } = this.tooltip.getBoundingClientRect();
        const x = event.pageX;
        const y = event.pageY;

        const posX = x - (width / 2);
        const posY = y - (height + 10);

        style.top = `${posY}px`;
        style.left = `${posX}px`;
    }

    handleArcMouseOut = () => {
        const { style } = this.tooltip;
        style.display = 'none';
    }

    drawChart = () => {
        const {
            boundingClientRect,
            data,
            childrenSelector,
            labelSelector,
            valueSelector,
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

        const group = svg
            .attr('width', width)
            .attr('height', height)
            .on('click', () => this.handleClick())
            .append('g')
            .attr('transform', this.svgGroupTransformation);

        const root = hierarchy(data, childrenSelector)
            .sum(d => valueSelector(d));
        const partitions = partition()(root);
        const slicesData = partitions.descendants();

        const slices = group
            .selectAll('g.slice')
            .data(slicesData);

        slices.exit().remove();

        const newSlice = slices
            .enter()
            .append('g')
            .attr('class', 'slice')
            .on('click', (d) => {
                event.stopPropagation();
                this.handleClick(d);
            });

        newSlice
            .append('path')
            .attr('class', 'main-arc')
            .style('fill', d => this.getColor(d))
            .attr('d', this.arch)
            .style('cursor', 'pointer')
            .style('stroke-width', d => d.height + 2)
            .style('stroke', 'white')
            .on('mouseover', this.handleArcMouseOver)
            .on('mousemove', this.handleArcMouseMove)
            .on('mouseout', this.handleArcMouseOut);

        newSlice
            .append('path')
            .attr('class', 'hidden-arc')
            .style('fill', 'none')
            .attr('id', (_, i) => `hiddenArc${i}`)
            .attr('d', this.middleArcLine);

        const text = newSlice
            .append('text')
            .attr('display', d => (this.filterText(d) ? null : 'none'))
            .style('pointer-events', 'none');

        text
            .append('textPath')
            .attr('startOffset', '50%')
            .attr('text-anchor', 'middle')
            .attr('xlink:href', (_, i) => `#hiddenArc${i}`)
            .text(d => labelSelector(d.data))
            .style('fill', (d) => {
                const colorBg = this.getColor(d);
                return getColorOnBgColor(colorBg);
            });
    }

    redrawChart = () => {
        const context = select(this.svg);
        context.selectAll('*').remove();
        this.drawChart();
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
