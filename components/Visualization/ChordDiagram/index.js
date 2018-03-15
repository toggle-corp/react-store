import React from 'react';
import { select, event } from 'd3-selection';
import { scaleOrdinal, schemeCategory20c } from 'd3-scale';
import { chord, ribbon } from 'd3-chord';
import { arc } from 'd3-shape';
import { descending } from 'd3-array';
import { PropTypes } from 'prop-types';
import SvgSaver from 'svgsaver';
import Responsive from '../../General/Responsive';
import { getStandardFilename, getColorOnBgColor } from '../../../utils/common';
import styles from './styles.scss';

/**
 * boundingClientRect: the width and height of the container.
 * data: the nxn square matrix representing the directed flow amongst a network of n nodes.
 * labelsData: array of n string representing the individual nodes.
 * colorScheme: array of hex color values.
 * showLabels: if true the labels are drawn.
 * showTooltip: if true the tooltip is rendered.
 * className: additional class name for styling.
 * margins: the margin object with properties for the four sides(clockwise from top).
 */

const propTypes = {
    boundingClientRect: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }).isRequired,
    data: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
    labelsData: PropTypes.arrayOf(PropTypes.string).isRequired,
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
    data: [],
    colorScheme: schemeCategory20c,
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

/**
 * Chord diagram displays  the inter-relationships between data in a matrix.The data are arranged
 * radially around a circle with the relationships between the data points typically drawn as arcs
 * connecting the data.
 */
@Responsive
export default class ChordDiagram extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    componentDidMount() {
        this.drawChart();
    }

    componentDidUpdate() {
        this.redrawChart();
    }

    setContext = (width, height, margins, data) => {
        const {
            top,
            right,
            bottom,
            left,
        } = margins;

        return select(this.svg)
            .attr('width', width + left + right)
            .attr('height', height + top + bottom)
            .append('g')
            .attr('transform', `translate(${(width + left + right) / 2}, ${(height + top + bottom) / 2})`)
            .datum(data);
    }

    save = () => {
        const svg = select(this.svg);
        const svgsaver = new SvgSaver();
        svgsaver.asSvg(svg.node(), `${getStandardFilename('chord-diagram', 'graph')}.svg`);
    }

    addGlowGradients = (svg) => {
        const defs = svg.append('defs');

        const filter = defs
            .append('filter')
            .attr('id', 'glow');

        filter
            .append('feGaussianBlur')
            .attr('class', 'blur')
            .attr('stdDeviation', '4.5')
            .attr('result', 'coloredBlur');

        const feMerge = filter.append('feMerge');
        feMerge
            .append('feMergeNode')
            .attr('in', 'coloredBlur');
        feMerge
            .append('feMergeNode')
            .attr('in', 'SourceGraphic');
    }

    fade = (opacity) => {
        const { svg } = this;
        return function dim(g, i) {
            select(svg)
                .selectAll('.ribbons path')
                .filter(d => (d.source.index !== i && d.target.index !== i))
                .style('opacity', opacity);
        };
    }

    mouseOverArc = (d, element) => {
        const { labelsData } = this.props;

        select(element)
            .style('filter', 'url(#glow)');

        return select(this.tooltip)
            .html(`<span class="name">${labelsData[d.index]}</span>`)
            .transition()
            .style('display', 'inline-block');
    }

    mouseMoveArc = () => (
        select(this.tooltip)
            .style('top', `${event.pageY - 30}px`)
            .style('left', `${event.pageX + 20}px`)
    )

    mouseOutArc = (element) => {
        select(element)
            .style('filter', null);

        return select(this.tooltip)
            .transition()
            .style('display', 'none');
    }

    addPaths = (element, arcs, colors) => {
        const { showTooltip, showLabels, labelsData } = this.props;
        const group = element
            .selectAll('g')
            .data(d => d.groups)
            .enter()
            .append('g')
            .on('mouseover', this.fade(0.1))
            .on('mouseout', this.fade(1));

        const paths = group
            .append('path')
            .style('fill', d => colors(d.index))
            .style('stroke', '#dcdcdc')
            .attr('d', arcs)
            .each(function change(d, i) {
                const firstArcSection = /(^.+?)L/;

                let newArc = firstArcSection.exec(select(this).attr('d'))[1];
                newArc.replace(/,/g, ' ');
                if (d.endAngle > (90 * (Math.PI / 180)) && d.startAngle < (180 * (Math.PI / 180))) {
                    const startLoc = /M(.*?)A/;
                    const middleLoc = /A(.*?),0/;
                    const endLoc = /,1,(.*?)$/;

                    const newStart = newArc.match(endLoc).pop();
                    const newEnd = newArc.match(startLoc).pop();
                    const middleSec = newArc.match(middleLoc).pop();

                    newArc = `M${newStart}A${middleSec},0,0,0,${newEnd}`;
                }
                element
                    .append('path')
                    .attr('class', 'hiddenArcs')
                    .attr('id', `arc${i}`)
                    .attr('d', newArc)
                    .style('fill', 'none');
            });

        if (showTooltip) {
            const that = this;
            paths
                .on('mouseover', function handle(d) {
                    that.mouseOverArc(d, this);
                })
                .on('mousemove', this.mouseMoveArc)
                .on('mouseout', function handle() {
                    that.mouseOutArc(this);
                });
        }
        if (showLabels) {
            this.addLabels(group, labelsData, paths, colors);
        }
    }

    addLabels = (selection, labels, paths, colors) => {
        const group = selection
            .append('text')
            .attr('pointer-events', 'none')
            .attr('dy', d => (d.endAngle > (90 * (Math.PI / 180)) && d.startAngle < (180 * (Math.PI / 180)) ? -10 : 15));

        group
            .append('textPath')
            .attr('startOffset', '50%')
            .style('text-anchor', 'middle')
            .attr('xlink:href', (d, i) => `#arc${i}`)
            .text(d => labels[d.index])
            .style('fill', d => getColorOnBgColor(colors(d.index)));

        group
            .filter(function filtrate(d, i) {
                // eslint-disable-next-line no-underscore-dangle
                return (((paths._groups[0][i].getTotalLength() / 2) - 30)
                    < this.getComputedTextLength());
            })
            .remove();
    }

    addRibbons = (element, ribbons, colors) => {
        element
            .selectAll('path')
            .data(d => d)
            .enter()
            .append('path')
            .attr('d', ribbons)
            .style('fill', d => colors(d.source.index))
            .style('stroke', '#dcdcdc');
    }

    redrawChart = () => {
        const context = select(this.svg);
        context.selectAll('*').remove();
        this.drawChart();
    }

    drawChart = () => {
        const {
            data,
            boundingClientRect,
            colorScheme,
            margins,
        } = this.props;

        if (!boundingClientRect.width || !data || data.length === 0) {
            return;
        }

        let { width, height } = boundingClientRect;

        const {
            top,
            right,
            bottom,
            left,
        } = margins;

        width = width - left - right;
        height = height - top - bottom;

        const outerRadius = (Math.min(width, height) * 0.5);
        let innerRadius = outerRadius - 24;

        if (innerRadius < 0) {
            innerRadius = 0;
        }

        const chords = chord()
            .padAngle(0.05)
            .sortSubgroups(descending);

        const arcs = arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius);

        const ribbons = ribbon()
            .radius(innerRadius);

        const colors = scaleOrdinal().range(colorScheme);

        const context = this.setContext(width, height, margins, chords(data));
        const chordsGroup = context.append('g').attr('class', 'chords');
        const ribbonsGroup = context.append('g').attr('class', 'ribbons');

        this.addPaths(chordsGroup, arcs, colors);
        this.addRibbons(ribbonsGroup, ribbons, colors);
        this.addGlowGradients(select(this.svg));
    }

    render() {
        const { className } = this.props;
        const containerStyle = `${styles['chord-diagram-container']} ${className}`;
        const chordStyle = styles['chord-diagram'];
        const tooltipStyle = styles.tooltip;
        return (
            <div
                className={containerStyle}
                ref={(el) => { this.container = el; }}
            >
                <div
                    className={tooltipStyle}
                    ref={(el) => { this.tooltip = el; }}
                />
                <svg
                    className={chordStyle}
                    ref={(elem) => { this.svg = elem; }}
                />
            </div>
        );
    }
}
