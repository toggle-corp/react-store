import React from 'react';
import CSSModules from 'react-css-modules';
import { select, event } from 'd3-selection';
import { scaleOrdinal } from 'd3-scale';
import { schemePaired } from 'd3-scale-chromatic';
import { forceSimulation, forceLink, forceManyBody, forceCenter } from 'd3-force';
import { drag } from 'd3-drag';
import { PropTypes } from 'prop-types';
import Responsive from '../Responsive';
import styles from './styles.scss';

const propTypes = {
    boundingClientRect: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }).isRequired,
    data: PropTypes.shape({
        nodes: PropTypes.arrayOf(PropTypes.object),
        links: PropTypes.arrayOf(PropTypes.object),
    }),
    idAccessor: PropTypes.func.isRequired,
    groupAccessor: PropTypes.func,
    valueAccessor: PropTypes.func,
    margins: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
    }),
    colorScheme: PropTypes.arrayOf(PropTypes.string),
};

const defaultProps = {
    data: {
        nodes: [],
        link: [],
    },
    margins: {
        top: 50,
        right: 50,
        bottom: 100,
        left: 100,
    },
    groupAccessor: d => d.index,
    valueAccessor: () => 1,
    colorScheme: schemePaired,
};

@Responsive
@CSSModules(styles)
export default class ForceDirectedGraph extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    componentDidMount() {
        this.renderChart();
    }

    componentDidUpdate() {
        this.renderChart();
    }

    renderChart() {
        const {
            data,
            boundingClientRect,
            idAccessor,
            groupAccessor,
            valueAccessor,
            colorScheme,
            margins,
        } = this.props;

        if (!boundingClientRect.width) {
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
            .style('position', 'absolute')
            .style('z-index', 10);

        width = width - left - right;
        height = height - top - bottom;

        const radius = Math.min(width, height) / 2;

        const group = svg
            .attr('width', width + left + right)
            .attr('height', height + top + bottom)
            .append('g')
            .attr('transform', `translate(${left}, ${top})`);

        const color = scaleOrdinal().range(colorScheme);

        const simulation = forceSimulation()
            .force('link', forceLink().id(d => idAccessor(d)).distance(radius / 4))
            .force('charge', forceManyBody())
            .force('center', forceCenter(width / 2, height / 2));

        function hideTooltip() {
            tooltip.transition().style('display', 'none');
        }

        function dragstarted(d) {
            hideTooltip();
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;// eslint-disable-line
            d.fy = d.y;// eslint-disable-line
        }

        function dragged(d) {
            hideTooltip();
            d.fx = event.x;// eslint-disable-line
            d.fy = event.y;// eslint-disable-line
        }

        function dragended(d) {
            hideTooltip();
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;// eslint-disable-line
            d.fy = null;// eslint-disable-line
        }

        function mouseOverCircle(d) {
            tooltip.html(`<span class="name">${idAccessor(d)}</span>`);
            return tooltip
                .transition()
                .duration(100)
                .style('display', 'inline-block');
        }

        function mouseMoveCircle() {
            return tooltip
                .style('top', `${event.pageY - 30}px`)
                .style('left', `${event.pageX + 20}px`);
        }

        function mouseOutCircle() {
            return tooltip
                .transition()
                .duration(100)
                .style('display', 'none');
        }

        const link = group
            .append('g')
            .attr('class', 'links')
            .selectAll('line')
            .data(data.links)
            .enter()
            .append('line')
            .attr('stroke', color(0))
            .attr('stroke-width', d => Math.sqrt(valueAccessor(d)));

        const node = group
            .append('g')
            .attr('class', 'nodes')
            .selectAll('nodes')
            .data(data.nodes)
            .enter()
            .append('circle')
            .attr('r', 5)
            .attr('fill', d => color(groupAccessor(d)))
            .call(drag()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended))
            .on('mouseover', mouseOverCircle)
            .on('mousemove', mouseMoveCircle)
            .on('mouseout', mouseOutCircle);

        function ticked() {
            link
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);

            node
                .attr('cx', d => d.x)
                .attr('cy', d => d.y);
        }

        simulation
            .nodes(data.nodes)
            .on('tick', ticked);

        simulation
            .force('link')
            .links(data.links);
    }
    render() {
        return (
            <div
                className="force-directed-graph-container"
                ref={(el) => { this.container = el; }}
            >
                <svg
                    className="force-directed-graph"
                    ref={(elem) => { this.svg = elem; }}
                />
            </div>
        );
    }
}
