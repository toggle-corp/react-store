import React from 'react';
import ReactFauxDOM from 'react-faux-dom';
import PropTypes from 'prop-types';
import { select } from 'd3-selection';
import { scaleOrdinal } from 'd3-scale';
import { arc, pie } from 'd3-shape';

const propTypes = {
    data: PropTypes.array,
    valueAccessor: PropTypes.func.isRequired,
    labelAccessor: PropTypes.func.isRequired,
};
const defaultProps = {
    data: [],
};

export default class DonutChart extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        // Initial state
        console.log(this.props.data);
    }

    render() {
        const {
            data,
            valueAccessor,
            labelAccessor,
        } = this.props;
        // TODO: dynamic height,
        const height = 400;
        const width = 400;
        const radius = Math.min(width, height) / 2;

        const color = scaleOrdinal()
            .range([
                '#98abc5', '#8a89a6', '#7b6888',
                '#6b486b', '#a05d56', '#d0743c', '#ff8c00',
            ]);

        const arch = arc()
            .outerRadius(radius - 10)
            .innerRadius(radius - 70);

        const pies = pie().value(valueAccessor);

        const el = ReactFauxDOM.createElement('div');
        const svg = select(el)
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate( ${width / 2}, ${height / 2})`);

        const group = svg.selectAll('.arc')
            .data(pies(data))
            .enter()
            .append('g')
            .attr('class', 'arc');

        group.append('path')
            .attr('d', arch)
            .style('fill', d => color(valueAccessor(d.data)));

        group.append('text')
            .attr('transform', d => `translate(${arch.centroid(d)})`)
            .attr('dy', '1em')
            .attr('text-anchor', 'middle')
            .text(d => labelAccessor(d.data));

        return el.toReact();
    }
}
