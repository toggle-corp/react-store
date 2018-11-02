import React, {
    PureComponent,
    Fragment,
} from 'react';
import SvgSaver from 'svgsaver';
import { PropTypes } from 'prop-types';
import { drag } from 'd3-drag';
import {
    select,
    event,
} from 'd3-selection';
import { timer } from 'd3-timer';
import { range } from 'd3-array';

import {
    scaleSequential,
} from 'd3-scale';

import {
    forceSimulation,
    forceCenter,
    forceCollide,
} from 'd3-force';
import { interpolateRainbow } from 'd3-scale-chromatic';

import { forceAttract } from 'd3-force-attract/index';
import { forceCluster } from 'd3-force-cluster/index';

import Responsive from '../../General/Responsive';
import Float from '../../View/Float';

import {
    groupList,
    getStandardFilename,
} from '../../../utils/common';

import styles from './styles.scss';

const propTypes = {
    boundingClientRect: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }).isRequired,
    data: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        value: PropTypes.number,
    })),
    idSelector: PropTypes.func.isRequired,
    groupSelector: PropTypes.func,
    valueSelector: PropTypes.func,
    setSaveFunction: PropTypes.func,
    scaleFactor: PropTypes.number,
    onHover: PropTypes.func,
    className: PropTypes.string,
    colorScheme: PropTypes.func,
    margins: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
    }),
};
const defaultProps = {
    data: {
    },
    margins: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    },
    setSaveFunction: () => {},
    groupSelector: d => d.cluster,
    valueSelector: d => d.score,
    scaleFactor: 2,
    onHover: () => {},
    className: '',
    colorScheme: interpolateRainbow,
};

class ClusterForceLayout extends PureComponent {
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
        this.updateData(this.props.data);
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.data !== this.props.data) {
            this.updateData(nextProps.data);
        }
    }

    componentDidUpdate() {
        this.redrawChart();
    }


    onMouseOver = (d) => {
        this.props.onHover(d);
        select(this.style)
            .style('display', 'block');
    }

    onMouseMove = (d) => {
        select(this.tooltip)
            .html(`<span class=${styles.id}>${d.id}</span>
            <span class=${styles.score}>${d.radius}</span>`)
            .style('display', 'block')
            .style('top', `${event.pageY - 50}px`)
            .style('left', `${event.pageX - 30}px`);
    }

    onMouseOut = () => {
        select(this.tooltip)
            .style('display', 'none');
    }

    updateData = (data) => {
        this.data = JSON.parse(JSON.stringify(data));
    }

    dragstarted = (d) => {
        if (!event.active) this.simulation.alphaTarget(0.3).restart();
        d.fx = d.x; // eslint-disable-line no-param-reassign
        d.fy = d.y; // eslint-disable-line no-param-reassign
    }

    dragged = (d) => {
        d.fx = event.x; // eslint-disable-line no-param-reassign
        d.fy = event.y; // eslint-disable-line no-param-reassign
    }

    dragended = (d) => {
        if (!event.active) this.simulation.alphaTarget(0);
        d.fx = null; // eslint-disable-line no-param-reassign
        d.fy = null; // eslint-disable-line no-param-reassign
    }

    save = () => {
        const svgsaver = new SvgSaver();
        const svg = select(this.svg);
        svgsaver.asSvg(svg.node(), `${getStandardFilename('clustergraph', 'graph')}.svg`);
    }

    drawChart = () => {
        const {
            idSelector,
            groupSelector,
            boundingClientRect,
            valueSelector,
            scaleFactor,
            colorScheme,
            margins,
        } = this.props;

        let {
            width,
            height,
        } = boundingClientRect;

        const {
            top,
            right,
            bottom,
            left,
        } = margins;
        if (!boundingClientRect.width) return;

        width = width - left - right;
        height = height - top - bottom;

        const padding = 2;

        const clusterGroup = groupList(this.data, valueSelector);

        const noOfClusters = Object.keys(clusterGroup).length;

        const color = scaleSequential(interpolateRainbow)
            .domain(range(noOfClusters));

        const clusters = [];
        const nodes = this.data.map((node) => {
            const group = groupSelector(node);
            const radius = valueSelector(node) * scaleFactor;
            const element = {
                id: idSelector(node),
                radius,
                group,
                x: (Math.cos((group / noOfClusters) * 2 * Math.PI) * 200) +
                      (width / 2) + Math.random(),
                y: (Math.sin((group / noOfClusters) * 2 * Math.PI) * 200) +
                      (height / 2) + Math.random(),
            };
            const maxElementofGroup = clusters.find(cluster => cluster.group === group);
            if (!maxElementofGroup ||
                (radius > maxElementofGroup.radius)) {
                const index = clusters.findIndex(cluster => cluster.group === group);
                if (index === -1) {
                    clusters.push(element);
                } else {
                    clusters[index] = element;
                }
            }
            return element;
        });

        this.simulation = forceSimulation()
            .force('center', forceCenter(width / 2, height / 2))
            .force('attract', forceAttract()
                .target([width / 2, height / 2])
                .strength(0.01))
            .force('cluster', forceCluster()
                .centers(d => clusters.find(node => node.group === d.group))
                .strength(0.5)
                .centerInertia(0.1))
            .force('collide', forceCollide(d => (d.radius + padding))
                .strength(0));

        const group = select(this.svg)
            .attr('width', width + left + right)
            .attr('height', height + top + bottom);

        const node = group
            .append('g')
            .selectAll('circle')
            .data(nodes)
            .enter()
            .append('circle')
            .style('fill', d => (color(d.group / noOfClusters)))
            .call(drag()
                .on('start', this.dragstarted)
                .on('drag', this.dragged)
                .on('end', this.dragended))
            .on('mouseover', this.onMouseOver)
            .on('mousemove', this.onMouseMove)
            .on('mouseout', this.onMouseOut);

        // ramp up collision strength to provide smooth transition
        const transitionTime = 3000;
        const t = timer((elapsed) => {
            const dt = elapsed / transitionTime;
            this.simulation.force('collide').strength((dt ** dt) * 0.7);
            if (dt >= 1.0) t.stop();
        });

        this.simulation
            .nodes(nodes)
            .on('tick', () => {
                node
                    .attr('cx', d => d.x)
                    .attr('cy', d => d.y)
                    .attr('r', d => d.radius);
            });
    }

    redrawChart = () => {
        const svg = select(this.svg);
        svg.selectAll('*').remove();
        this.drawChart();
    }

    render() {
        const { className } = this.props;
        const svgClassName = [
            styles.clusterForceLayout,
            'clusterforcelayout',
            className,
        ].join(' ');

        return (
            <Fragment>
                <Float>
                    <div
                        ref={(el) => { this.tooltip = el; }}
                        className={styles.clusterTooltip}
                    />
                </Float>
                <svg
                    ref={(elem) => { this.svg = elem; }}
                    className={svgClassName}
                />
            </Fragment>
        );
    }
}

export default Responsive(ClusterForceLayout);
