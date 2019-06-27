import React, {
    PureComponent,
    Fragment,
} from 'react';
import {
    select,
    event,
} from 'd3-selection';
import { scaleOrdinal } from 'd3-scale';
import {
    chord,
    ribbon,
} from 'd3-chord';
import { arc } from 'd3-shape';
import { descending } from 'd3-array';
import { PropTypes } from 'prop-types';
import { schemePaired } from 'd3-scale-chromatic';
import { getColorOnBgColor } from '@togglecorp/fujs';

import Responsive from '../../General/Responsive';
import Float from '../../View/Float';

import { saveSvg, getStandardFilename } from '../../../utils/common';

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
     * The nxn square matrix representing the directed flow amongst a network of n nodes
     * see <a href="https://github.com/d3/d3-chord">d3-chord</a>
     */
    data: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
    /**
     * Handler function to save the generated svg
     */
    setSaveFunction: PropTypes.func,
    /**
     * Modifier to handle label info onMouseOver
     */
    labelModifier: PropTypes.func,
    /**
     * Array of labels
     */
    labelsData: PropTypes.arrayOf(PropTypes.string).isRequired,
    /**
     * Array of colors as hex color codes
     */
    colorScheme: PropTypes.arrayOf(PropTypes.string),
    /**
     * Handle visibility of labels on chord
     */
    showLabels: PropTypes.bool,
    /**
     * Handle visibility of tooltip
     */
    showTooltip: PropTypes.bool,
    /**
     * Additional sscss classes passed from parent
     */
    className: PropTypes.string,
    /**
     * Margins for the chart
     */
    margins: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
    }),
};

const defaultProps = {
    data: [],
    setSaveFunction: () => {},
    labelModifier: d => d,
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

const ribbonWidth = 24;

/**
 * Chord diagram displays the inter-relationships between data in a matrix.The data are arranged
 * radially around a circle with the relationships between the data points typically drawn as arcs
 * connecting the data.
 * see <a href="https://github.com/d3/d3-chord">d3-chord</a>
 */
class ChordDiagram extends PureComponent {
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

    setContext = (width, height, margins, data) => {
        const {
            top,
            right,
            bottom,
            left,
        } = margins;

        return select(this.svg)
            .append('g')
            .attr('transform', `translate(${(width + left + right) / 2}, ${(height + top + bottom) / 2})`)
            .datum(data);
    }

    save = () => {
        const svg = select(this.svg);
        saveSvg(svg.node(), `${getStandardFilename('chord-diagram', 'graph')}.svg`);
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
        return (g, i) => {
            select(svg)
                .selectAll('.ribbons path')
                .filter(d => (d.source.index !== i && d.target.index !== i))
                .style('opacity', opacity);
        };
    }

    handleMouseOver = (element, d) => {
        const {
            labelModifier,
            labelsData,
        } = this.props;

        select(element)
            .style('filter', 'url(#glow)');

        return select(this.tooltip)
            .html(`<span class=${styles.label}>${labelModifier(labelsData[d.index]) || ''}</span>`)
            .transition()
            .style('display', 'inline-block');
    }

    handleMouseMove = () => (
        select(this.tooltip)
            .style('top', `${event.pageY - 30}px`)
            .style('left', `${event.pageX + 20}px`)
    )

    handleMouseOut = (element) => {
        select(element)
            .style('filter', null);

        return select(this.tooltip)
            .transition()
            .style('display', 'none');
    }

    addPaths = (element, arcs, colors) => {
        const {
            showTooltip,
            showLabels,
            labelsData,
        } = this.props;

        const group = element
            .selectAll('g')
            .data(d => d.groups)
            .enter()
            .append('g')
            .on('mouseover', this.fade(0.1))
            .on('mouseout', this.fade(1));

        const paths = group
            .append('path')
            .attr('class', styles.path)
            .style('fill', d => colors(d.index))
            .attr('d', arcs)
            .each((d, i, nodes) => {
                const firstArcSection = /(^.+?)L/;
                let newArc = firstArcSection.exec(select(nodes[i]).attr('d'))[1];
                newArc.replace(/,/g, ' ');

                if (d.endAngle > (90 * (Math.PI / 180))
                    && d.startAngle < (180 * (Math.PI / 180))) {
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
            paths
                .on('mouseover', (d, i, nodes) => {
                    this.handleMouseOver(nodes[i], d);
                })
                .on('mousemove', this.handleMouseMove)
                .on('mouseout', (d, i, nodes) => {
                    this.handleMouseOut(nodes[i]);
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
            .attr('dy', d => (
                d.endAngle > (90 * (Math.PI / 180))
                && d.startAngle < (180 * (Math.PI / 180)) ? -10 : 15
            ));

        group
            .append('textPath')
            .attr('startOffset', '50%')
            .style('text-anchor', 'middle')
            .attr('xlink:href', (d, i) => `#arc${i}`)
            .text(d => labels[d.index])
            .style('fill', d => getColorOnBgColor(colors(d.index)));

        group
            .filter((d, i, nodes) => {
                // eslint-disable-next-line no-underscore-dangle
                const pathLength = (paths._groups[0][i].getTotalLength() - (ribbonWidth * 2)) / 2;
                return ((pathLength - 5) < nodes[i].getComputedTextLength());
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
            .attr('class', styles.path)
            .style('fill', d => colors(d.source.index));
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
        let innerRadius = outerRadius - ribbonWidth;

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
        const chordsGroup = context.append('g').attr('class', `chords ${styles.chords}`);
        const ribbonsGroup = context.append('g').attr('class', `ribbons ${styles.ribbons}`);

        this.addPaths(chordsGroup, arcs, colors);
        this.addRibbons(ribbonsGroup, ribbons, colors);
        this.addGlowGradients(select(this.svg));
    }

    render() {
        const {
            className,
            boundingClientRect: {
                width,
                height,
            },
        } = this.props;

        const chordStyle = [
            'chord-diagram',
            styles.chordDiagram,
            className,
        ].join(' ');

        return (
            <Fragment>
                <svg
                    ref={(elem) => { this.svg = elem; }}
                    className={chordStyle}
                    style={{
                        width,
                        height,
                    }}
                />
                <Float>
                    <div
                        ref={(elem) => { this.tooltip = elem; }}
                        className={styles.tooltip}
                    />
                </Float>
            </Fragment>
        );
    }
}

export default Responsive(ChordDiagram);
