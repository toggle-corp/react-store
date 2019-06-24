import React from 'react';
import { select, event } from 'd3-selection';
import { scaleLinear, scaleOrdinal } from 'd3-scale';
import { schemePaired } from 'd3-scale-chromatic';
import {
    forceSimulation,
    forceLink,
    forceManyBody,
    forceCenter,
} from 'd3-force';
import { drag } from 'd3-drag';
import { extent } from 'd3-array';
import { voronoi } from 'd3-voronoi';
import { PropTypes } from 'prop-types';
import SvgSaver from 'svgsaver';
import { doesObjectHaveNoData } from '@togglecorp/fujs';

import Responsive from '../../General/Responsive';
import {
    getStandardFilename,
    addClassName,
    removeClassName,
} from '../../../utils/common';

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
     * The data in the form of array of nodes and links
     * Each node element must have an id, label and corresponding group
     * Each link element is in the form of { source: sourceId, target: targetId value: number }
     */
    data: PropTypes.shape({
        nodes: PropTypes.arrayOf(PropTypes.object),
        links: PropTypes.arrayOf(PropTypes.object),
    }),
    /**
     * Handle diagram save functionality
     */
    setSaveFunction: PropTypes.func,
    /**
     * Select a unique id for each node
     */
    idSelector: PropTypes.func.isRequired,
    /**
     * Select a label for each node
     */
    labelSelector: PropTypes.func,
    /**
     * Select a group for each node
     */
    groupSelector: PropTypes.func,
    /**
     * Select the value for link
     * The value of link is corresponding reflected on the width of link
     */
    valueSelector: PropTypes.func,
    /**
     * Select the radius of each node
     */
    radiusSelector: PropTypes.func,
    /**
     * Id of the node to be highlighted
     */
    highlightClusterId: PropTypes.node,
    /**
     * If true, use voronoi interpolation
     */
    useVoronoi: PropTypes.bool,
    /**
     * Additional css classes passed from parent
     */
    className: PropTypes.string,
    /**
     * Array of colors as hex color codes
     */
    colorScheme: PropTypes.arrayOf(PropTypes.string),
    /**
     * Handler function on cluster size changes
     */
    onClusterSizeChange: PropTypes.func,
    /**
     * Length of each link in cluster
     */
    clusterSize: PropTypes.number,
    /**
     * Margins for the chart
     */
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
    setSaveFunction: () => {},
    groupSelector: d => d.index,
    labelSelector: d => d.label,
    valueSelector: () => 1,
    radiusSelector: () => 30,
    highlightClusterId: undefined,
    useVoronoi: false,
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


const deepCopy = data => (
    JSON.parse(JSON.stringify(data))
);
const circleRadius = 30;

/**
 * Represents the  network of nodes in force layout with many-body force.
 * Force directed graph helps to visualize connections between nodes in a network.
 * It can help to uncover relationships between groups as it naturally clusters well
 * connected nodes.
 *see <a href="https://github.com/d3/d3-force">d3-force</a>
 */
class ForceDirectedGraph extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        if (props.setSaveFunction) {
            props.setSaveFunction(this.save);
        }

        this.containerRef = React.createRef();
        this.svgRef = React.createRef();
    }

    componentDidMount() {
        this.data = deepCopy(this.props.data);

        const {
            boundingClientRect,
            idSelector,
            margins,
            colorScheme,
            groupSelector,
            valueSelector,
            radiusSelector,
            useVoronoi,
            clusterSize,
        } = this.props;

        this.renderChart({
            boundingClientRect,
            idSelector,
            margins,
            colorScheme,
            groupSelector,
            valueSelector,
            radiusSelector,
            useVoronoi,
            clusterSize,
            data: this.data,
        });
    }

    componentWillReceiveProps(nextProps) {
        const {
            data: oldData,
            boundingClientRect: oldBoundingClientRect,
            clusterSize: oldClusterSize,
            colorScheme: oldColorScheme,
            highlightClusterId: oldHighlightClusterId,
        } = this.props;

        const {
            data,
            boundingClientRect,
            clusterSize,
            idSelector,
            margins,
            colorScheme,
            valueSelector,
            groupSelector,
            radiusSelector,
            useVoronoi,
            highlightClusterId: newHighlightClusterId,
        } = nextProps;

        if (
            data !== oldData ||
            boundingClientRect !== oldBoundingClientRect ||
            clusterSize !== oldClusterSize ||
            colorScheme !== oldColorScheme
        ) {
            this.data = deepCopy(nextProps.data);
            this.renderChart({
                boundingClientRect,
                idSelector,
                groupSelector,
                valueSelector,
                radiusSelector,
                useVoronoi,
                colorScheme,
                clusterSize,
                margins,
                data: this.data,
            });
        }

        const { current: container } = this.containerRef;
        if (container) {
            const activeNode = container.getElementsByClassName(styles.activeNode)[0];
            if (activeNode) {
                removeClassName(activeNode, styles.activeNode);
            }
        }

        if (oldHighlightClusterId !== newHighlightClusterId) {
            if (container) {
                if (newHighlightClusterId) {
                    const highlightNodeClassName = `nodes-${newHighlightClusterId}`;
                    const newActiveNode = container
                        .getElementsByClassName(highlightNodeClassName)[0];

                    if (newActiveNode) {
                        addClassName(newActiveNode, styles.activeNode);
                    }
                }
            }
        }
    }

    save = () => {
        const { current: svgEl } = this.svgRef;
        const svg = select(svgEl);
        const svgsaver = new SvgSaver();
        svgsaver.asSvg(svg.node(), `${getStandardFilename('forceddirectedgraph', 'graph')}.svg`);
    }

    init = ({
        boundingClientRect: {
            width: widthFromProps,
            height: heightFromProps,
        },
        idSelector,
        margins: {
            top,
            right,
            bottom,
            left,
        },
        colorScheme,
        valueSelector,
        radiusSelector,
        clusterSize,
        data,
        container,
        svg,
    }) => {
        const minmax = extent(data.links, valueSelector);

        let radiusExtent = extent(data.nodes, radiusSelector);
        if (radiusExtent[0] === radiusExtent[1]) {
            radiusExtent = [0, radiusExtent[0]];
        }
        const width = widthFromProps - left - right;
        const height = heightFromProps - top - bottom;
        const radius = Math.min(width, height) / 2;
        const distance = scaleLinear()
            .domain([1, 10])
            .range([1, radius / 2]);

        this.tooltip = select(container)
            .append('div')
            .attr('class', styles.tooltip)
            .style('display', 'none')
            .style('z-index', 10);

        this.group = select(svg)
            .append('g')
            .attr('transform', `translate(${left}, ${top})`);

        this.color = scaleOrdinal().range(colorScheme);
        this.scaledValues = scaleLinear().domain(minmax).range([1, 3]);
        this.scaledRadius = scaleLinear().domain(radiusExtent).range([15, 30]);
        this.voronois = voronoi()
            .x(d => d.x)
            .y(d => d.y)
            .extent([[-10, -10], [width + 10, height + 10]]);

        const link = forceLink()
            .id(d => idSelector(d))
            .distance(distance(clusterSize));
        const charge = forceManyBody().strength(-10);
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
            radiusSelector,
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
            const radius = this.scaledRadius(radiusSelector(d));
            // eslint-disable-next-line no-param-reassign
            d.x = Math.max(radius, Math.min(width - radius, d.x));
            // eslint-disable-next-line no-param-reassign
            d.y = Math.max(radius, Math.min(height - radius, d.y));
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

    handleMouseOver = (d) => {
        const {
            onMouseOver,
            labelSelector,
        } = this.props;

        const title = labelSelector(d);

        if (onMouseOver) {
            onMouseOver(d);
        }

        this.tooltip.html(`
            <span class="name">
                ${title}
            </span>
        `);

        return this.tooltip
            .transition()
            .duration(100)
            .style('display', 'inline-block');
    }

    handleMouseMove = () => (
        this.tooltip
            .style('top', `${event.pageY - 30}px`)
            .style('left', `${event.pageX + 20}px`)
    )

    handleMouseOut = (d) => {
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

    handleDragStart = (d) => {
        this.hideTooltip();
        if (!event.active) {
            this.simulation.alphaTarget(0.3).restart();
        }
        d.fx = d.x; // eslint-disable-line no-param-reassign
        d.fy = d.y; // eslint-disable-line no-param-reassign
    };

    handleDrag = (d) => {
        this.hideTooltip();
        d.fx = event.x; // eslint-disable-line no-param-reassign
        d.fy = event.y; // eslint-disable-line no-param-reassign
    };

    handleDragEnd = (d) => {
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

    renderChart = ({
        boundingClientRect,
        clusterSize,
        idSelector,
        margins,
        colorScheme,
        valueSelector,
        groupSelector,
        radiusSelector,
        useVoronoi,
        data,
    }) => {
        const { current: container } = this.containerRef;
        const { current: svg } = this.svgRef;

        if (!container || !svg) {
            return;
        }

        // Clear out svg
        select(svg)
            .selectAll('*')
            .remove();
        select(container)
            .selectAll(styles.tooltip)
            .remove();

        if (!boundingClientRect.width || !data || data.length === 0 || doesObjectHaveNoData(data)) {
            return;
        }

        this.init({
            boundingClientRect,
            idSelector,
            margins,
            colorScheme,
            valueSelector,
            radiusSelector,
            clusterSize,
            data,
            container,
            svg,
        });

        this.links = this.group
            .append('g')
            .attr('class', styles.links)
            .selectAll('line')
            .data(data.links)
            .enter()
            .append('line')
            .attr('stroke-width', d => this.scaledValues(valueSelector(d)));

        this.nodes = this.group
            .selectAll('.nodes')
            .data(data.nodes)
            .enter()
            .append('g')
            .attr('class', (d) => {
                // FIXME: Donot do this, use keySelector
                const {
                    id,
                    group,
                } = d;

                const classNames = [
                    styles.nodes,
                    'nodes',
                    `nodes-${id}-${group}`,
                ];

                return classNames.join(' ');
            })
            .call(
                drag()
                    .on('start', this.handleDragStart)
                    .on('drag', this.handleDrag)
                    .on('end', this.handleDragEnd),
            )
            .on('mouseover', this.handleMouseOver)
            .on('mousemove', this.handleMouseMove)
            .on('mouseout', this.handleMouseOut);

        if (useVoronoi) {
            this.nodes
                .append('circle')
                .attr('class', styles.circle)
                .attr('r', circleRadius)
                .attr('fill', d => this.color(groupSelector(d)));

            this.nodes
                .append('circle')
                .attr('r', 3)
                .attr('fill', 'black');
        } else {
            this.nodes
                .append('circle')
                .attr('r', d => this.scaledRadius(radiusSelector(d)))
                .attr('fill', d => this.color(groupSelector(d)));
        }

        this.simulation
            .nodes(data.nodes)
            .on('tick', this.ticked);

        this.simulation
            .force('link')
            .links(data.links);
    }

    render() {
        const {
            className: classNameFromProps,
            clusterSize,
        } = this.props;

        const containerClassName = `
            ${classNameFromProps}
            ${styles.forceDirectedGraphContainer}
            force-directed-graph-container
        `;

        const inputSliderClassName = `
            ${styles.inputSlider}
            input-slider
        `;

        const svgClassName = `
            ${styles.forceDirectedGraph}
            force-directed-graph
        `;

        return (
            <div
                className={containerClassName}
                ref={this.containerRef}
            >
                <input
                    className={inputSliderClassName}
                    id="sliderinput"
                    type="range"
                    step="1"
                    min="1"
                    max="10"
                    value={clusterSize}
                    onChange={this.handleClusterSizeInputChange}
                />
                <svg
                    className={svgClassName}
                    ref={this.svgRef}
                />
            </div>
        );
    }
}

export default Responsive(ForceDirectedGraph);
