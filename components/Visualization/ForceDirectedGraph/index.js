import React from 'react';
import CSSModules from 'react-css-modules';
import { select, event } from 'd3-selection';
import { scaleOrdinal } from 'd3-scale';
import { schemePaired } from 'd3-scale-chromatic';
import { forceSimulation, forceLink, forceManyBody, forceCenter } from 'd3-force';
import { drag } from 'd3-drag';
import { voronoi } from 'd3-voronoi';
import { PropTypes } from 'prop-types';
import SvgSaver from 'svgsaver';
import Responsive from '../Responsive';
import styles from './styles.scss';

/**
 * boundingClientRect: the width and height of the container.
 * data: the object containing array of nodes and links.
 * idAccessor: returns the id of each node.
 * groupAccessor: return the group which each nodes belong to.
 * valueAccessor: returns the value of each link.
 * useVoronoi: use Voronoi clipping for nodes.
 * circleRadius: The radius of the circle
 * colorScheme: the array of hex color values.
 * className: additional class name for styling.
 * margins: the margin object with properties for the four sides(clockwise from top).
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
    idAccessor: PropTypes.func.isRequired,
    groupAccessor: PropTypes.func,
    valueAccessor: PropTypes.func,
    circleRadius: PropTypes.number,
    useVoronoi: PropTypes.bool,
    className: PropTypes.string,
    colorScheme: PropTypes.arrayOf(PropTypes.string),
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
    circleRadius: 30,
    useVoronoi: true,
    className: '',
    colorScheme: schemePaired,
};
/**
 * Represents the  network of nodes in force layout with many-body force.
 */

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

    save = () => {
        const svg = select(this.svg);
        const svgsaver = new SvgSaver();
        svgsaver.asSvg(svg.node(), `forceddirectedgraph-${Date.now()}.svg`);
    }

    renderChart() {
        const {
            data,
            boundingClientRect,
            idAccessor,
            groupAccessor,
            valueAccessor,
            circleRadius,
            colorScheme,
            useVoronoi,
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
            .style('display', 'none')
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

        const voronois = voronoi()
            .x(d => d.x)
            .y(d => d.y)
            .extent([[-10, -10], [width + 10, height + 10]]);

        function recenterVoronoi(nodes) {
            const shapes = [];
            voronois.polygons(nodes).forEach((d) => {
                if (!d.length) return;
                const n = [];
                d.forEach((c) => {
                    n.push([c[0] - d.data.x, c[1] - d.data.y]);
                });
                n.data = d.data;
                shapes.push(n);
            });
            return shapes;
        }

        const simulation = forceSimulation()
            .force('link', forceLink().id(d => idAccessor(d)).distance(radius / 3))
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
            .attr('stroke-width', d => Math.sqrt(valueAccessor(d)));

        const node = group
            .selectAll('.nodes')
            .data(data.nodes)
            .enter()
            .append('g')
            .attr('class', 'nodes')
            .call(drag()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended))
            .on('mouseover', mouseOverCircle)
            .on('mousemove', mouseMoveCircle)
            .on('mouseout', mouseOutCircle);

        if (useVoronoi) {
            node
                .append('circle')
                .attr('class', 'circle')
                .attr('r', circleRadius)
                .attr('fill', d => color(groupAccessor(d)));

            node
                .append('circle')
                .attr('r', 3)
                .attr('fill', 'black');
        } else {
            node
                .append('circle')
                .attr('r', 5)
                .attr('fill', d => color(groupAccessor(d)));
        }

        function ticked() {
            node.each((d) => {
                d.x = Math.max(circleRadius, Math.min(width - circleRadius, d.x)); // eslint-disable-line
                d.y = Math.max(circleRadius, Math.min(height - circleRadius, d.y)); // eslint-disable-line
            });

            link
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);

            if (useVoronoi) {
                node
                    .attr('transform', d => `translate(${d.x}, ${d.y})`)
                    .attr('clip-path', d => `url(#clip-${d.index})`);

                const clip = group
                    .selectAll('clipPath')
                    .data(recenterVoronoi(node.data()), d => d.data.index);

                clip
                    .enter()
                    .append('clipPath')
                    .attr('id', d => `clip-${d.data.index}`)
                    .attr('class', 'clip');

                clip
                    .exit()
                    .remove();

                clip
                    .selectAll('path')
                    .remove();
                clip
                    .append('path')
                    .attr('d', d => `M${d.join(',')}Z`);
            } else {
                node
                    .attr('transform', d => `translate(${d.x}, ${d.y})`);
            }
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
                className={`force-directed-graph-container ${this.props.className}`}
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
