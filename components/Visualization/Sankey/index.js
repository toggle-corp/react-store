import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
import SvgSaver from 'svgsaver';
import { schemePaired } from 'd3-scale-chromatic';
import { select } from 'd3-selection';
import { extent } from 'd3-array';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';
import { scaleLinear, scaleOrdinal } from 'd3-scale';

import LoadingAnimation from '../../View/LoadingAnimation';
import Responsive from '../../General/Responsive';
import BoundError from '../../General/BoundError';

import { getStandardFilename } from '../../../utils/common';
import styles from './styles.scss';

/**
 * boundingClientRect: the width and height of the container.
 * data: the data to use to plot pie chart.
 * valueAccessor: return the value for the unit data.
 * labelAccessor: returns the individual label from a unit data.
 * colorScheme: array of hex color values.
 * className: additional class name for styling.
 */
const propTypes = {
    boundingClientRect: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }).isRequired,
    data: PropTypes.shape({
        nodes: PropTypes.arrayOf(PropTypes.object),
        links: PropTypes.arrayOf(PropTypes.object),
    }),
    valueAccessor: PropTypes.func,
    labelAccessor: PropTypes.func,
    fontSizeExtent: PropTypes.arrayOf(PropTypes.number),
    colorScheme: PropTypes.arrayOf(PropTypes.string),
    className: PropTypes.string,
    loading: PropTypes.bool,
    margins: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
    }),
};

const defaultProps = {
    data: {
        nodes: [],
        links: [],
    },
    valueAccessor: d => d.value,
    labelAccessor: d => d.label,
    colorScheme: schemePaired,
    fontSizeExtent: [14, 30],
    className: '',
    loading: false,
    margins: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    },
};

@BoundError()
@Responsive
export default class Sankey extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    componentDidMount() {
        this.drawChart();
    }

    componentDidUpdate() {
        this.redrawChart();
    }

    setContext = (width, height, margins) => {
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
            .attr('transform', `translate(${left}, ${top})`);
    }

    getFontSize = (d) => {
        const { valueAccessor } = this.props;
        return Math.floor(this.dynamicFontSize(valueAccessor(d)));
    }

    updateRangeFontData = (nodes) => {
        const { valueAccessor } = this.props;
        this.dynamicFontSize.domain(extent(nodes, d => valueAccessor(d)));
    }

    dynamicFontSize = scaleLinear().range(this.props.fontSizeExtent);

    save = () => {
        const svg = select(this.svg);
        const svgsaver = new SvgSaver();
        svgsaver.asSvg(svg.node(), `${getStandardFilename('sankey', 'graph')}.svg`);
    }

    redrawChart = () => {
        const context = select(this.svg);
        context.selectAll('*').remove();
        this.drawChart();
    }

    addLinks = (element, data, colors) => {
        const { labelAccessor, valueAccessor } = this.props;

        const links = element
            .selectAll('.link')
            .data(data)
            .enter()
            .append('path')
            .attr('class', 'link')
            .style('fill', 'none')
            .attr('d', sankeyLinkHorizontal())
            .style('cursor', 'pointer')
            .style('stroke-width', d => Math.max(1, d.width))
            .style('stroke', d => colors(labelAccessor(d.source)))
            .style('stroke-opacity', 0.3)
            .sort((a, b) => b.width - a.width)
            .on('mouseover', (d, i, nodes) => {
                select(nodes[i]).style('stroke-opacity', 0.8);
            })
            .on('mouseout', (d, i, nodes) => {
                select(nodes[i]).style('stroke-opacity', 0.3);
            });

        links
            .append('title')
            .text(d => `${labelAccessor(d.source)} → ${labelAccessor(d.target)}\n${valueAccessor(d)}`);
    }

    addNodes = (element, data, colors, width) => {
        const { labelAccessor, valueAccessor } = this.props;
        const nodes = element
            .selectAll('.node')
            .data(data)
            .enter()
            .append('g')
            .attr('class', 'node');

        nodes
            .append('rect')
            .attr('id', d => `node${d.index}`)
            .attr('x', d => d.x0)
            .attr('y', d => d.y0)
            .attr('height', d => d.y1 - d.y0)
            .attr('width', d => d.x1 - d.x0)
            .style('fill', d => colors(labelAccessor(d) || '#d3d3d3'))
            .style('opacity', 0.8)
            .style('stroke', '#d3d3d3')
            .style('cursor', 'pointer')
            .append('text')
            .text(d => `${labelAccessor(d)} ${valueAccessor(d)}`);

        nodes
            .append('text')
            .attr('x', d => d.x0 - 6)
            .attr('y', d => ((d.y1 + d.y0) / 2))
            .attr('dy', '.35em')
            .attr('text-anchor', 'end')
            .text(d => labelAccessor(d))
            .style('font-size', d => this.getFontSize(d))
            .filter(d => d.x0 < width / 2)
            .attr('x', d => d.x1 + 6)
            .attr('text-anchor', 'start');

        nodes
            .append('title')
            .text(d => `${labelAccessor(d)}\n${valueAccessor(d)}`);

        const links = select(this.svg)
            .selectAll('.link');

        nodes
            .on('mouseover', (d) => {
                nodes
                    .select(`#node${d.index}`)
                    .style('opacity', 1);

                links
                    .transition()
                    .duration(300)
                    .style('opacity', 0.1);

                links
                    .filter(s => d.name === s.source.name)
                    .transition()
                    .duration(300)
                    .style('opacity', 1);

                links
                    .filter(t => d.name === t.target.name)
                    .transition()
                    .duration(300)
                    .style('opacity', 1);
            })
            .on('mouseout', (d) => {
                nodes
                    .select(`#node${d.index}`)
                    .style('opacity', 0.8);

                links
                    .transition()
                    .duration(500)
                    .style('opacity', 0.8);
            });
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
        const context = this.setContext(width, height, margins);
        const links = context.append('g').attr('class', 'links');
        const nodes = context.append('g').attr('class', 'nodes');

        const colors = scaleOrdinal().range(colorScheme);

        const sankeyGenerator = sankey()
            .nodeWidth(25)
            .nodePadding(10)
            .extent([[1, 1], [width - 1, height - 1]]);

        sankeyGenerator(data);

        this.updateRangeFontData(data.nodes);

        this.addLinks(links, data.links, colors);
        this.addNodes(nodes, data.nodes, colors, width);
    }

    render() {
        const {
            className,
            loading,
        } = this.props;

        return (
            <div
                className={`${styles['sankey-container']} ${className}`}
                ref={(el) => { this.container = el; }}
            >
                { loading && <LoadingAnimation /> }
                <svg
                    className={styles.sankey}
                    ref={(elem) => { this.svg = elem; }}
                />
            </div>
        );
    }
}
