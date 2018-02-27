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
import LoadingAnimation from '../../View/LoadingAnimation';

// FIXME: don't use globals
// eslint-disable-next-line no-unused-vars
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
    loading: PropTypes.bool,
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
    loading: false,
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
        this.renderChart();
    }

    componentDidUpdate() {
        this.renderChart();
    }

    getGradId = d => `linkGrad-${d.source.index}-${d.target.index}`;

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

    addGradients = (svg, innerRadius, chords, colors) => {
        function start(t, func) {
            return innerRadius *
            func(((t.source.endAngle - t.source.startAngle) / 2) +
            (t.source.startAngle - (Math.PI / 2)));
        }

        function end(t, func) {
            return innerRadius *
            func(((t.target.endAngle - t.target.startAngle) / 2) +
           (t.target.startAngle - (Math.PI / 2)));
        }
        const grads = svg
            .append('defs')
            .selectAll('linearGradient')
            .data(chords)
            .enter()
            .append('linearGradient')
            .attr('id', this.getGradId)
            .attr('gradientUnits', 'userSpaceOnUse')
            .attr('x1', t => start(t, Math.cos))
            .attr('y1', t => start(t, Math.sin))
            .attr('x2', t => end(t, Math.cos))
            .attr('y2', t => end(t, Math.sin));

        grads
            .append('stop')
            .attr('offset', '0%')
            .attr('stop-color', t => colors(t.source.index));

        grads
            .append('stop')
            .attr('offset', '100%')
            .attr('stop-color', t => colors(t.target.index));
    }

    save = () => {
        const svg = select(this.svg);
        const svgsaver = new SvgSaver();
        svgsaver.asSvg(svg.node(), `${getStandardFilename('chord-diagram', 'graph')}.svg`);
    }


    renderChart() {
        const {
            data,
            boundingClientRect,
            labelsData,
            colorScheme,
            showLabels,
            showTooltip,
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

        const svg = select(this.svg);
        svg.selectAll('*').remove();

        select(this.container)
            .selectAll('.tooltip')
            .remove();

        const tooltip = select(this.container)
            .append('div')
            .attr('class', 'tooltip')
            .style('z-index', 10)
            .style('display', 'none');

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

        const color = scaleOrdinal().range(colorScheme);

        const chart = svg
            .attr('width', width + left + right)
            .attr('height', height + top + bottom)
            .append('g')
            .attr('transform', `translate(${(width + left + right) / 2}, ${(height + top + bottom) / 2})`)
            .datum(chords(data));

        this.addGlowGradients(svg);
        this.addGradients(svg, innerRadius, chords(data), color);

        function mouseOverArc(d) {
            tooltip.html(`<span class="name">${labelsData[d.index]}</span>`);
            select(this)
                .style('filter', 'url(#glow)');

            tooltip
                .transition()
                .style('display', 'inline-block');
        }

        function mouseMoveArc() {
            return tooltip
                .style('top', `${event.pageY - 30}px`)
                .style('left', `${event.pageX + 20}px`);
        }


        function mouseOutArc() {
            select(this)
                .style('filter', null);
            return tooltip
                .transition()
                .style('display', 'none');
        }

        function fade(opacity) {
            return function dim(g, i) {
                svg
                    .selectAll('.ribbons path')
                    .filter(d => (d.source.index !== i && d.target.index !== i))
                    .style('opacity', opacity);
            };
        }

        const group = chart
            .append('g')
            .attr('class', 'groups')
            .selectAll('g')
            .data(d => d.groups)
            .enter()
            .append('g')
            .on('mouseover', fade(0.1))
            .on('mouseout', fade(1));

        const groupPath = group
            .append('path')
            .attr('class', 'arcs')
            .style('fill', d => color(d.index))
            .style('stroke', '#dcdcdc')
            .attr('d', arcs)
            .each(function change(d, i) {
                const firstArcSection = /(^.+?)L/;

                let newArc = firstArcSection.exec(select(this).attr('d'))[1];
                newArc.replace(/,/g, ' ');
                if (d.endAngle > (90 * (Math.PI / 180)) && d.startAngle < (270 * (Math.PI / 180))) {
                    const startLoc = /M(.*?)A/;
                    const middleLoc = /A(.*?),0/;
                    const endLoc = /,1,(.*?)$/;

                    const newStart = newArc.match(endLoc).pop();
                    const newEnd = newArc.match(startLoc).pop();
                    const middleSec = newArc.match(middleLoc).pop();

                    newArc = `M${newStart}A${middleSec},0,0,0,${newEnd}`;
                }
                chart
                    .append('path')
                    .attr('class', 'hiddenArcs')
                    .attr('id', `arc${i}`)
                    .attr('d', newArc)
                    .style('fill', 'none');
            });

        if (showTooltip) {
            groupPath
                .on('mouseover', mouseOverArc)
                .on('mousemove', mouseMoveArc)
                .on('mouseout', mouseOutArc);
        }

        if (showLabels) {
            const groupText = group
                .append('text')
                .attr('pointer-events', 'none')
                .attr('dy', d => (d.endAngle > (90 * (Math.PI / 180)) && d.startAngle < (270 * (Math.PI / 180)) ? -10 : 15));

            groupText
                .append('textPath')
                .attr('startOffset', '50%')
                .style('text-anchor', 'middle')
                .attr('xlink:href', (d, i) => `#arc${i}`)
                .text(d => labelsData[d.index])
                .style('fill', d => getColorOnBgColor(color(d.index)));

            groupText
                .filter(function filtrate(d, i) {
                    // eslint-disable-next-line no-underscore-dangle
                    return (((groupPath._groups[0][i].getTotalLength() / 2) - 30)
                        < this.getComputedTextLength());
                })
                .remove();
        }

        chart
            .append('g')
            .attr('class', 'ribbons')
            .selectAll('path')
            .data(d => d)
            .enter()
            .append('path')
            .attr('d', ribbons)
            .style('fill', d => `url(#${this.getGradId(d)})`)
            .style('stroke', '#dcdcdc');
    }

    render() {
        const { loading } = this.props;

        return (
            <div
                className={`chord-diagram-container ${this.props.className}`}
                ref={(el) => { this.container = el; }}
            >
                { loading && <LoadingAnimation /> }
                <svg
                    className="chord-diagram"
                    ref={(elem) => { this.svg = elem; }}
                />
            </div>
        );
    }
}
