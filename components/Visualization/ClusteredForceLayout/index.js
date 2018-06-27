import React, {
    PureComponent,
    Fragment,
} from 'react';
import { drag } from 'd3-drag';
import { extent } from 'd3-array';
import { set } from 'd3-collection';
import SvgSaver from 'svgsaver';
import { PropTypes } from 'prop-types';
import { schemePaired } from 'd3-scale-chromatic';
import { select, event } from 'd3-selection';
import { line, curveCatmullRomClosed } from 'd3-shape';
import { polygonHull, polygonCentroid } from 'd3-polygon';
import {
    scaleLinear,
    scaleOrdinal,
    scaleSqrt,
} from 'd3-scale';
import {
    forceSimulation,
    forceLink,
    forceManyBody,
    forceCenter,
} from 'd3-force';

import Responsive from '../../General/Responsive';
import Float from '../../View/Float';
import {
    getStandardFilename,
    isObjectEmpty,
} from '../../../utils/common';

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
    className: PropTypes.string,
    colorScheme: PropTypes.arrayOf(PropTypes.string),
    circleRadiusExtent: PropTypes.arrayOf(PropTypes.number),
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
    margins: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    },
    groupAccessor: d => d.index,
    valueAccessor: () => 1,
    className: '',
    colorScheme: schemePaired,
    circleRadiusExtent: [5, 10],
};

class ClusteredForceLayout extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {
            value: 5,
        };
    }

    componentDidMount() {
        this.drawChart();
        this.updateData(this.props);
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.data !== this.props.data) {
            this.updateData(nextProps);
        }
    }

    componentDidUpdate() {
        this.redrawChart();
    }

    save = () => {
        const svgsaver = new SvgSaver();
        const svg = select(this.svg);
        svgsaver.asSvg(svg.node(), `${getStandardFilename('forceddirectedgraph', 'graph')}.svg`);
    }

    init = () => {
        const {
            idAccessor,
            boundingClientRect,
            valueAccessor,
            colorScheme,
            margins,
            circleRadiusExtent,
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

        const {
            data,
        } = this;

        this.group = select(this.svg)
            .attr('width', width + left + right)
            .attr('height', height + top + bottom)
            .append('g')
            .attr('transform', `translate(${left}, ${top})`);

        const getNumberOfLinks = (links, value) => links.reduce((n, link) => {
            const matches = (link.source === value || link.target === value
                          || link.source.id === value || link.target.id === value);
            return (n + matches);
        }, 0);

        this.nodeSizes = data.nodes.map((node) => {
            const name = node.id;
            const size = getNumberOfLinks(data.links, name);
            return { id: name, size };
        });
        this.radius = Math.min(width, height) / 2;
        this.nodeDistance = scaleLinear()
            .domain([1, 10])
            .range([1, this.radius / 3]);
        this.color = scaleOrdinal()
            .range(colorScheme);
        this.distance = scaleLinear()
            .domain([1, 10])
            .range([2, this.radius / 2]);
        this.minmax = extent(data.links, valueAccessor);
        this.nodeSizeExtent = extent(this.nodeSizes, d => d.size);
        this.scaledWidth = scaleLinear()
            .domain(this.minmax)
            .range([1, 3]);
        this.scaledRadius = scaleSqrt()
            .domain(this.nodeSizeExtent)
            .range(circleRadiusExtent);
        this.valueline = line()
            .x(d => d[0])
            .y(d => d[1])
            .curve(curveCatmullRomClosed);
        this.groupIds = set(data.nodes.map(node => node.group))
            .values()
            .map(groupId =>
                (
                    {
                        groupId,
                        count: data.nodes.filter(node => node.group === +groupId).length,
                    }
                ))
            .filter(out => out.count > 2)
            .map(out => out.groupId);

        this.simulation = forceSimulation()
            .force('link', forceLink()
                .id(d => idAccessor(d))
                .distance((d) => {
                    if (d.source.group !== d.target.group) {
                        return this.distance(+this.state.value * 2);
                    }
                    return this.distance(this.state.value);
                }))
            .force('charge', forceManyBody())
            .force('center', forceCenter(width / 2, height / 2));
    }

    updateData(props) {
        this.data = JSON.parse(JSON.stringify(props.data));
    }

    redrawChart = () => {
        const svg = select(this.svg);
        svg.selectAll('*').remove();
        this.drawChart();
    }

    handleSlide = (eve) => {
        this.setState({
            value: eve.target.value,
        });
        this.updateData(this.props);
    }

    mouseOverNode = (node) => {
        const { idAccessor } = this.props;

        select(this.tooltip)
            .html(`<span>${idAccessor(node) || ''}</span>`)
            .style('display', 'inline-block')
            .style('top', `${event.pageY - 30}px`)
            .style('left', `${event.pageX + 20}px`);
    }

    mouseOutNode = () => {
        select(this.tooltip)
            .style('display', 'none');
    }

    dragstart = (d) => {
        if (!event.active) this.simulation.alphaTarget(0.3).restart();
        d.fx = d.x; // eslint-disable-line no-param-reassign
        d.fy = d.y; // eslint-disable-line no-param-reassign
    }

    dragged = (d) => {
        select(this.tooltip)
            .style('display', 'none');
        d.fx = event.x; // eslint-disable-line no-param-reassign
        d.fy = event.y; // eslint-disable-line no-param-reassign
    }

    dragend = (d) => {
        if (!event.active) this.simulation.alphaTarget(0);
        d.fx = null;// eslint-disable-line no-param-reassign
        d.fy = null;// eslint-disable-line no-param-reassign
    }

    groupDragStart = (node) => {
        if (!event.active) this.simulation.alphaTarget(0.3).restart();
        select(node)
            .select('path')
            .style('stroke-width', 3);
    }

    groupDragged = (nodes, groupId) => {
        nodes
            .filter(d => d.group === +groupId)
            .each((d) => {
                d.x += event.dx; // eslint-disable-line no-param-reassign
                d.y += event.dy; // eslint-disable-line no-param-reassign
            });
    }

    groupDragEnd = (node) => {
        if (!event.active) this.simulation.alphaTarget(0).restart();
        select(node)
            .select('path')
            .style('stroke-width', 1);
    }

    updateGroups = (node, paths) => {
        const {
            groupIds,
            valueline,
        } = this;

        const polygonGenerator = (groupId) => {
            const nodeCoordinates = node
                .filter(d => d.group === +groupId)
                .data()
                .map(d => [d.x, d.y]);

            return polygonHull(nodeCoordinates);
        };

        groupIds.forEach((groupId) => {
            const path = paths
                .filter(d => d === groupId)
                .attr('transform', 'scale(1), translate(0,0)')
                .attr('d', (d) => {
                    const polygon = polygonGenerator(d);
                    const centroid = polygonCentroid(polygon);
                    this.centroid = centroid;
                    return valueline(polygon.map((point) => {
                        const x = point[0] - centroid[0];
                        const y = point[1] - centroid[1];
                        return [x, y];
                    }));
                });
            select(path.node().parentNode)
                .attr('transform', `translate(${this.centroid[0]}, ${this.centroid[1]}) scale(${1.2})`);
        });
    }

    drawChart = () => {
        const {
            idAccessor,
            boundingClientRect,
            groupAccessor,
            valueAccessor,
        } = this.props;

        if (!boundingClientRect.width || isObjectEmpty(this.data)) {
            return;
        }

        this.init();

        const {
            data,
            group,
            scaledWidth,
            nodeSizes,
            nodeSizeExtent,
            scaledRadius,
            color,
            dragstart,
            dragged,
            dragend,
            mouseOverNode,
            mouseOutNode,
            groupIds,
            groupDragStart,
            groupDragged,
            groupDragEnd,
            simulation,
            updateGroups,
        } = this;

        const groups = group
            .append('g')
            .attr('class', 'groups');

        const link = group
            .append('g')
            .attr('class', 'links')
            .selectAll('line')
            .data(data.links)
            .enter()
            .append('line')
            .style('stroke-width', d => scaledWidth(valueAccessor(d)))
            .style('stroke', '#999')
            .style('stroke-opacity', '0.1');

        const node = group
            .append('g')
            .attr('class', 'nodes')
            .selectAll('circle')
            .data(data.nodes)
            .enter()
            .append('circle')
            .attr('class', 'node')
            .attr('r', (d) => {
                const size = nodeSizes
                    .find(value => value.id === idAccessor(d)).size || nodeSizeExtent[0];
                return scaledRadius(size);
            })
            .attr('fill', d => color(groupAccessor(d)))
            .call(drag()
                .on('start', dragstart)
                .on('drag', dragged)
                .on('end', dragend))
            .on('mouseenter', mouseOverNode)
            .on('mouseout', mouseOutNode);

        const paths = groups
            .selectAll('.enclosed_path')
            .data(groupIds, d => d)
            .enter()
            .append('g')
            .attr('class', 'enclosed_path')
            .append('path')
            .style('stroke', d => color(d))
            .style('fill', d => color(d))
            .style('opacity', 0);

        paths
            .transition()
            .duration(700)
            .style('opacity', 1)
            .style('fill-opacity', 0.1)
            .style('stroke-opacity', 1);

        groups
            .selectAll('.enclosed_path')
            .call(drag()
                .on('start', (d, i, nodes) => groupDragStart(nodes[i]))
                .on('drag', d => groupDragged(node, d))
                .on('end', (d, i, nodes) => groupDragEnd(nodes[i])));

        simulation
            .nodes(data.nodes)
            .on('tick', () => {
                link
                    .attr('x1', d => d.source.x)
                    .attr('y1', d => d.source.y)
                    .attr('x2', d => d.target.x)
                    .attr('y2', d => d.target.y);

                node
                    .attr('cx', d => d.x)
                    .attr('cy', d => d.y);

                updateGroups(node, paths);
            });

        simulation
            .force('link')
            .links(data.links);
    }

    render() {
        const { className } = this.props;
        const svgClassName = [
            styles.forcedDirectedGraph,
            className,
        ].join(' ');

        return (
            <Fragment>
                <Float>
                    <div
                        ref={(el) => { this.tooltip = el; }}
                        className={styles.forcedTooltip}
                    />
                </Float>
                <input
                    className={styles.inputSlider}
                    id="sliderinput"
                    type="range"
                    min="1"
                    max="10"
                    value={this.state.value}
                    onChange={this.handleSlide}
                    step="1"
                />
                <svg
                    ref={(elem) => { this.svg = elem; }}
                    className={svgClassName}
                />
            </Fragment>
        );
    }
}

export default Responsive(ClusteredForceLayout);
