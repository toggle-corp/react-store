import React from 'react';
import CSSModules from 'react-css-modules';
import { select, event } from 'd3-selection';
import { scaleOrdinal } from 'd3-scale';
import { schemePaired } from 'd3-scale-chromatic';
import { forceSimulation, forceLink, forceManyBody, forceCenter } from 'd3-force';
import { drag } from 'd3-drag';
import { PropTypes } from 'prop-types';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

@CSSModules(styles)
export default class ForceDirectedGraph extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            boundingClientRect: {},
            render: false,
        };
    }

    componentDidMount() {
        window.addEventListener('resize', this.handleResize);

        setTimeout(() => {
            this.setState({
                render: true,
                boundingClientRect: this.container.getBoundingClientRect(),
            });
        }, 0);
    }

    componentDidUpdate() {
        this.renderChart();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }

    handleResize = () => {
        this.setState({
            render: true,
            boundingClientRect: this.container.getBoundingClientRect(),
        });
    }

    renderChart() {
        if (!this.state.render) {
            return;
        }
        let { width, height } = this.state.boundingClientRect;


        const {
            top,
            right,
            bottom,
            left,
        } = {
            top: 50,
            right: 50,
            bottom: 50,
            left: 50,
        };

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
            .force('link', forceLink().id(d => d.id))
            .force('charge', forceManyBody())
            .force('center', forceCenter(width / 2, height / 2));

        const nodes = [
            { id: 'Toggle', group: 1 },
            { id: 'Corp', group: 2 },
            { id: 'Nepal', group: 3 },
            { id: 'Countries', group: 4 },
            { id: 'Yes', group: 1 },
            { id: 'No', group: 2 },
            { id: 'India', group: 3 },
        ];

        const links = [
            { source: 'Corp', target: 'Toggle', value: 1 },
            { source: 'Nepal', target: 'Countries', value: 2 },
            { source: 'Yes', target: 'No', value: 2 },
            { source: 'India', target: 'Countries', value: 3 },
            { source: 'Corp', target: 'Countries', value: 1 },
        ];

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
            .data(links)
            .enter()
            .append('line')
            .attr('stroke', color(0))
            .attr('stroke-width', d => Math.sqrt(d.value));

        const node = group
            .append('g')
            .attr('class', 'nodes')
            .selectAll('nodes')
            .data(nodes)
            .enter()
            .append('circle')
            .attr('r', 5)
            .attr('fill', d => color(d.group))
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
            .nodes(nodes)
            .on('tick', ticked);

        simulation
            .force('link')
            .links(links);
    }
    render() {
        return (
            <div
                ref={(el) => { this.container = el; }}
                styleName="force-container"
                className={this.props.className}
            >
                <svg
                    styleName="svg"
                    ref={(elem) => { this.svg = elem; }}
                />
            </div>
        );
    }
}
