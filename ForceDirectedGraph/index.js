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

        console.log(idAccessor);
        const svg = select(this.svg);
        svg.selectAll('*').remove();

        width = width - left - right;
        height = height - top - bottom;

        const group = svg
            .attr('width', width + left + right)
            .attr('height', height + top + bottom)
            .append('g')
            .attr('transform', `translate(${left}, ${top})`);

        const color = scaleOrdinal().range(schemePaired);

        const simulation = forceSimulation()
            .force('link', forceLink().id(d => idAccessor(d)))
            .force('charge', forceManyBody())
            .force('center', forceCenter(width / 2, height / 2));

        function dragstarted(d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;// eslint-disable-line
            d.fy = d.y;// eslint-disable-line
        }

        function dragged(d) {
            d.fx = event.x;// eslint-disable-line
            d.fy = event.y;// eslint-disable-line
        }

        function dragended(d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;// eslint-disable-line
            d.fy = null;// eslint-disable-line
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
                .on('end', dragended));

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

        node
            .append('title')
            .text(d => d.id);

        simulation
            .nodes(data.nodes)
            .on('tick', ticked);

        simulation
            .force('link')
            .links(data.links);
    }
    render() {
        return (
            <svg
                styleName="force-directed-graph"
                ref={(elem) => { this.svg = elem; }}
            />
        );
    }
}
