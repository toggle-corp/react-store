import React, {
    PureComponent,
    Fragment,
} from 'react';
import SvgSaver from 'svgsaver';
import { PropTypes } from 'prop-types';
import { drag } from 'd3-drag';
import { select, event } from 'd3-selection';
import { timer } from 'd3-timer';
import { range } from 'd3-array';

import {
    scaleSequential,
    interpolateRainbow,
} from 'd3-scale';

import {
    forceSimulation,
    forceCenter,
    forceCollide,
} from 'd3-force';
import { forceAttract } from 'd3-force-attract';
import { forceCluster } from 'd3-force-cluster';

import Responsive from '../../General/Responsive';
import Float from '../../View/Float';

import {
    groupList,
    getStanadardFilename,
} from '../../../utils/common';

import styles from './styles.scss';

const propTypes = {
    boundingClientRect: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }).isRequired,
    data: PropTypes.arrayOf(PropTypes.shape({
        value: PropTypes.string,
        score: PropTypes.number,
    })),
    idAccessor: PropTypes.func.isRequired,
    groupAccessor: PropTypes.func,
    valueAccessor: PropTypes.func,
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
    },
    margins: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    },
    groupAccessor: d => d.cluster,
    valueAccessor: d => d.score,
    className: '',
    colorScheme: interpolateRainbow,
};

class ClusterForceLayout extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    componentDidMount() {
        this.drawChart();
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.data !== this.props.data) {
            this.updateData(nextProps);
        }
    }

    componentDidUpdate() {
        this.redrawChart();
    }

    getMaxNode = (data, valueAccessor) => data.reduce((previous, current) => (
        valueAccessor(current) > valueAccessor(previous) ? current : previous
    ))

    save = () => {
        const svgsaver = new SvgSaver();
        const svg = select(this.svg);
        svgsaver.asSvg(svg.node(), `${getStanadardFilename('clustergraph', 'graph')}.svg`);
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

    drawChart = () => {
        const {
            data,
            idAccessor,
            groupAccessor,
            boundingClientRect,
            valueAccessor,
            colorScheme,
            margins,
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
        if (!boundingClientRect.width) return;

        this.width = width - left - right;
        this.height = height - top - bottom;

        const padding = 2;

        const clusterGroup = groupList(data, valueAccessor);

        const noOfClusters = Object.keys(clusterGroup).length;

        const color = scaleSequential(colorScheme)
            .domain(range(noOfClusters));

        const clusters = [];
        const nodes = data.map((node) => {
            const group = groupAccessor(node);
            const radius = valueAccessor(node);
            const element = {
                id: idAccessor(node),
                radius,
                group,
                x: (Math.cos((group / noOfClusters) * 2 * Math.PI) * 200) +
                      (width / 2) + Math.random(),
                y: (Math.sin((group / noOfClusters) * 2 * Math.PI) * 200) +
                      (height / 2) + Math.random(),
            };
            if (!clusters.find(cluster => cluster.group === group) ||
                (radius > clusters.find(cluster => cluster.group === group).radius)) {
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
            .force('center', forceCenter(this.width / 2, this.height / 2))
            .force('attract', forceAttract()
                .target([this.width / 2, this.height / 2])
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
                .on('end', this.dragended));

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
