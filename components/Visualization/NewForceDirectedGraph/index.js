import React from 'react';
import { select, event } from 'd3-selection';
import { scaleLinear, scaleOrdinal } from 'd3-scale';
import { schemePaired } from 'd3-scale-chromatic';
import { forceSimulation, forceLink, forceManyBody, forceCenter } from 'd3-force';
import { drag } from 'd3-drag';
import { extent } from 'd3-array';
import { voronoi } from 'd3-voronoi';
import { PropTypes } from 'prop-types';
import SvgSaver from 'svgsaver';
import Responsive from '../../General/Responsive';
import { getStandardFilename, isObjectEmpty } from '../../../utils/common';

// FIXME: don't use globals
// eslint-disable-next-line no-unused-vars
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
    // eslint-disable-next-line react/no-unused-prop-types
    colorScheme: PropTypes.arrayOf(PropTypes.string),
    onClusterSizeChange: PropTypes.func,
    clusterSize: PropTypes.number,
    margins: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
    }),

    onMouseOver: PropTypes.func,
    onMouseOut: PropTypes.func,
};

const defaultProps = {
    data: {
        nodes: [],
        links: [],
    },
    groupAccessor: d => d.index,
    valueAccessor: () => 1,
    circleRadius: 30,
    useVoronoi: true,
    className: '',
    colorScheme: schemePaired,
    onClusterSizeChange: () => {},
    clusterSize: 5,
    margins: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    },
    onMouseOver: undefined,
    onMouseOut: undefined,
};
/**
 * Represents the  network of nodes in force layout with many-body force.
 */

class ForceDirectedGraph extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.container = React.createRef();
        this.svg = React.createRef();
    }

    componentDidMount() {
        this.updateData(this.props);
        this.init(this.props);
        this.renderChart();
    }

    componentWillReceiveProps(nextProps) {
        const {
            data: oldData,
            boundingClientRect: oldBoundingClientRect,
            clusterSize: oldClusterSize,
        } = this.props;

        const {
            data: newData,
            boundingClientRect: newBoundingClientRect,
            clusterSize: newClusterSize,
        } = nextProps;

        const dataChanged = newData !== oldData;
        const boundingClientRectChanged = newBoundingClientRect !== oldBoundingClientRect;
        const clusterSize = newClusterSize !== oldClusterSize;

        if (dataChanged || boundingClientRectChanged || clusterSize) {
            this.updateData(nextProps);
            this.init(nextProps);
            this.renderChart();
        }
    }

    updateData(props) {
        this.data = JSON.parse(JSON.stringify(props.data));
    }

    save = () => {
        const { current: svgEl } = this.svg;
        const svg = select(svgEl);
        const svgsaver = new SvgSaver();
        svgsaver.asSvg(svg.node(), `${getStandardFilename('forceddirectedgraph', 'graph')}.svg`);
    }

    init = (props) => {
        const { current: container } = this.container;
        const { current: svgEl } = this.svg;

        if (!container || !svgEl) {
            return;
        }

        const svg = select(svgEl);
        svg.selectAll('*').remove();

        const {
            boundingClientRect,
            margins,
            colorScheme,
            valueAccessor,
            clusterSize,
        } = props;

        const {
            width: widthFromProps,
            height: heightFromProps,
        } = boundingClientRect;

        if (!widthFromProps) {
            return;
        }

        const {
            top,
            right,
            bottom,
            left,
        } = margins;

        const width = widthFromProps - left - right;
        const height = heightFromProps - top - bottom;

        const radius = Math.min(width, height) / 2;

        select(container)
            .selectAll('.tooltip')
            .remove();

        this.tooltip = select(container)
            .append('div')
            .attr('class', 'tooltip')
            .style('display', 'none')
            .style('z-index', 10);

        this.distance = scaleLinear()
            .domain([1, 10])
            .range([1, radius / 2]);

        this.group = svg
            .attr('width', width + left + right)
            .attr('height', height + top + bottom)
            .append('g')
            .attr('transform', `translate(${left}, ${top})`);

        this.color = scaleOrdinal().range(colorScheme);
        this.minmax = extent(this.data.links, valueAccessor);
        this.scaledValues = scaleLinear().domain(this.minmax).range([1, 3]);

        this.voronois = voronoi()
            .x(d => d.x)
            .y(d => d.y)
            .extent([[-10, -10], [width + 10, height + 10]]);

        const link = forceLink()
            .id(d => this.props.idAccessor(d))
            .distance(this.distance(clusterSize));
        const charge = forceManyBody();
        const center = forceCenter(width / 2, height / 2);

        this.simulation = forceSimulation()
            .force('link', link)
            .force('charge', charge)
            .force('center', center);
    }

    ticked = () => {
        const {
            boundingClientRect,
            margins,
            circleRadius,
            useVoronoi,
        } = this.props;

        const {
            width: widthFromProps,
            height: heightFromProps,
        } = boundingClientRect;

        const {
            top,
            right,
            bottom,
            left,
        } = margins;

        const width = widthFromProps - left - right;
        const height = heightFromProps - top - bottom;

        this.nodes.each((d) => {
            // eslint-disable-next-line no-param-reassign
            d.x = Math.max(circleRadius, Math.min(width - circleRadius, d.x));

            // eslint-disable-next-line no-param-reassign
            d.y = Math.max(circleRadius, Math.min(height - circleRadius, d.y));
        });

        this.links
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);

        if (useVoronoi) {
            this.nodes
                .attr('transform', d => `translate(${d.x}, ${d.y})`)
                .attr('clip-path', d => `url(#clip-${d.index})`);

            const clip = this.group
                .selectAll('clipPath')
                .data(
                    this.recenterVoronoi(this.nodes.data()),
                    d => d.data.index,
                );

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
            this.nodes.attr('transform', d => `translate(${d.x}, ${d.y})`);
        }
    };

    recenterVoronoi = (nodes) => {
        const shapes = [];
        this.voronois.polygons(nodes).forEach((d) => {
            if (!d.length) return;
            const n = [];
            d.forEach((c) => {
                n.push([c[0] - d.data.x, c[1] - d.data.y]);
            });
            n.data = d.data;
            shapes.push(n);
        });
        return shapes;
    };

    mouseOverCircle = (d) => {
        const {
            onMouseOver,
            idAccessor,
        } = this.props;

        const id = idAccessor(d);

        if (onMouseOver) {
            onMouseOver(d);
        }

        this.tooltip.html(`
            <span class="name">
                ${id}
            </span>
        `);

        return this.tooltip
            .transition()
            .duration(100)
            .style('display', 'inline-block');
    }

    mouseMoveCircle = () => (
        this.tooltip
            .style('top', `${event.pageY - 30}px`)
            .style('left', `${event.pageX + 20}px`)
    )

    mouseOutCircle = (d) => {
        const { onMouseOut } = this.props;

        if (onMouseOut) {
            onMouseOut(d);
        }

        return this.tooltip
            .transition()
            .duration(100)
            .style('display', 'none');
    }

    hideTooltip = () => {
        this.tooltip.transition().style('display', 'none');
    };

    dragstarted = (d) => {
        this.hideTooltip();
        if (!event.active) {
            this.simulation.alphaTarget(0.3).restart();
        }
        d.fx = d.x; // eslint-disable-line no-param-reassign
        d.fy = d.y; // eslint-disable-line no-param-reassign
    };

    dragged = (d) => {
        this.hideTooltip();
        d.fx = event.x; // eslint-disable-line no-param-reassign
        d.fy = event.y; // eslint-disable-line no-param-reassign
    };

    dragended = (d) => {
        this.hideTooltip();
        if (!event.active) {
            this.simulation.alphaTarget(0);
        }

        d.fx = null; // eslint-disable-line no-param-reassign
        d.fy = null; // eslint-disable-line no-param-reassign
    };

    handleClusterSizeInputChange = (e) => {
        const { value } = e.target;
        const { onClusterSizeChange } = this.props;

        onClusterSizeChange(value);
    }

    renderChart() {
        const {
            boundingClientRect,
            groupAccessor,
            valueAccessor,
            circleRadius,
            useVoronoi,
        } = this.props;
        const { data } = this;

        if (!boundingClientRect.width) {
            return;
        }

        if (!data || data.length === 0 || isObjectEmpty(data)) {
            return;
        }

        this.links = this.group
            .append('g')
            .attr('class', 'links')
            .selectAll('line')
            .data(data.links)
            .enter()
            .append('line')
            .attr('stroke-width', d => this.scaledValues(valueAccessor(d)));

        this.nodes = this.group
            .selectAll('.nodes')
            .data(data.nodes)
            .enter()
            .append('g')
            .attr('class', 'nodes')
            .call(
                drag()
                    .on('start', this.dragstarted)
                    .on('drag', this.dragged)
                    .on('end', this.dragended),
            )
            .on('mouseover', this.mouseOverCircle)
            .on('mousemove', this.mouseMoveCircle)
            .on('mouseout', this.mouseOutCircle);

        if (useVoronoi) {
            this.nodes
                .append('circle')
                .attr('class', 'circle')
                .attr('r', circleRadius)
                .attr('fill', d => this.color(groupAccessor(d)));

            this.nodes
                .append('circle')
                .attr('r', 3)
                .attr('fill', 'black');
        } else {
            this.nodes
                .append('circle')
                .attr('r', 5)
                .attr('fill', d => this.color(groupAccessor(d)));
        }

        this.simulation
            .nodes(this.data.nodes)
            .on('tick', this.ticked);

        this.simulation
            .force('link')
            .links(this.data.links);
    }

    render() {
        const {
            className: classNameFromProps,
            clusterSize,
        } = this.props;

        const className = `
            force-directed-graph-container
            ${classNameFromProps}
        `;

        return (
            <div
                className={className}
                ref={this.container}
            >
                <input
                    className="input-slider"
                    id="sliderinput"
                    type="range"
                    min="1"
                    max="10"
                    value={clusterSize}
                    onChange={this.handleClusterSizeInputChange}
                    step="1"
                />
                <svg
                    className="force-directed-graph"
                    ref={this.svg}
                />
            </div>
        );
    }
}

export default Responsive(ForceDirectedGraph);
