import React from 'react';
import CSSModules from 'react-css-modules';
import { select } from 'd3-selection';
import { scaleOrdinal } from 'd3-scale';
import { schemePaired } from 'd3-scale-chromatic';
import { hierarchy, treemap } from 'd3-hierarchy';
import { format } from 'd3-format';
import { PropTypes } from 'prop-types';
import Responsive from '../Responsive';
import styles from './styles.scss';

const propTypes = {
    boundingClientRect: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }).isRequired,
    data: PropTypes.shape({
        name: PropTypes.string,
    }),
    valueAccessor: PropTypes.func.isRequired,
    labelAccessor: PropTypes.func.isRequired,
    margins: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
    }),
};

const defaultProps = {
    data: [],
    margins: {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50,
    },
};

@Responsive
@CSSModules(styles)
export default class TreeMap extends React.PureComponent {
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
            valueAccessor,
            labelAccessor,
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

        width = width - left - right;
        height = height - top - bottom;

        const group = svg
            .attr('width', width + left + right)
            .attr('height', height + top + bottom)
            .append('g')
            .attr('transform', `translate(${left}, ${top})`);

        const color = scaleOrdinal().range(schemePaired);
        const formats = format(',d');

        const treemaps = treemap()
            .size([width, height])
            .round(true)
            .paddingInner(1);

        const root = hierarchy(data)
            .sum(d => valueAccessor(d));

        treemaps(root);

        const cell = group
            .selectAll('g')
            .data(root.leaves())
            .enter()
            .append('g')
            .attr('transform', d => `translate(${d.x0},${d.y0})`);

        cell.append('rect')
            .attr('id', d => d.data.name)
            .attr('width', d => d.x1 - d.x0)
            .attr('height', d => d.y1 - d.y0)
            .attr('fill', d => color(labelAccessor(d.parent.data)));

        cell.append('text')
            .attr('x', d => (d.x1 - d.x0) / 2)
            .attr('y', d => (d.y1 - d.y0) / 2)
            .attr('text-anchor', 'middle')
            .attr('class', 'text-label')
            .text(d => labelAccessor(d.data));
        cell
            .append('title')
            .text(d => `${labelAccessor(d.data)}\n${formats(valueAccessor(d.data))}`);
    }

    render() {
        return (
            <svg
                styleName="treemap"
                ref={(elem) => { this.svg = elem; }}
            />

        );
    }
}
