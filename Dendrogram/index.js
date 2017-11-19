import React from 'react';
import CSSModules from 'react-css-modules';
import { select } from 'd3-selection';
import { cluster, hierarchy } from 'd3-hierarchy';
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
    labelAccessor: PropTypes.func.isRequired,
    lineColor: PropTypes.string,
    margins: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
    }),
};

const defaultProps = {
    data: [],
    lineColor: '#555',
    margins: {
        top: 50,
        right: 50,
        bottom: 100,
        left: 100,
    },
};

@Responsive
@CSSModules(styles)
export default class Dendrogram extends React.PureComponent {
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
            labelAccessor,
            lineColor,
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
        const tree = cluster()
            .size([height, width - 100]);

        const root = hierarchy(data);
        tree(root);

        group
            .selectAll('.link')
            .data(root.descendants().slice(1))
            .enter()
            .append('path')
            .attr('class', 'link')
            .attr('stroke', lineColor)
            .attr('fill', 'none')
            .attr('stroke-opacity', 0.4)
            .attr('storke-width', 1.5)
            .attr('d', d =>
                `M${d.y},${d.x}C${d.parent.y + 100},${d.x}` +
                          ` ${d.parent.y + 100},${d.parent.x} ${d.parent.y},${d.parent.x}`);

        const node = group
            .selectAll('.node')
            .data(root.descendants())
            .enter()
            .append('g')
            .attr('class', d => `node ${d.children ? 'node-internal' : 'node-leaf'}`)
            .attr('transform', d => `translate(${d.y}, ${d.x})`);

        node.append('circle')
            .style('fill', '#555')
            .attr('r', 2.5);

        node.append('text')
            .attr('dy', '.3em')
            .attr('dx', d => (d.children ? -8 : 8))
            .style('text-anchor', d => (d.children ? 'end' : 'start'))
            .style('text-shadow', '0 1px 0 #fff, 0 -1px 0 #fff, 1px 0 0 #fff, -1px 0 0 #fff')
            .text(d => labelAccessor(d.data));
    }
    render() {
        return (
            <svg
                styleName="dendrogram"
                ref={(elem) => { this.svg = elem; }}
            />
        );
    }
}
