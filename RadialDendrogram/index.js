import React from 'react';
import CSSModules from 'react-css-modules';
import { select } from 'd3-selection';
import { tree, hierarchy } from 'd3-hierarchy';
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
export default class RadialDendrogram extends React.PureComponent {
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
            .attr('transform', `translate(${((width + left + right) / 2)}, ${((height + top + bottom) / 2)})`);

        const radius = width < height ? width / 2 : height / 2;
        const trees = tree()
            .size([360, radius])
            .separation((a, b) => ((a.parent === b.parent ? 1 : 2) / a.depth));

        const root = hierarchy(data);
        trees(root);

        function project(x, y) {
            const angle = ((x - 90) / 180) * Math.PI;
            return [y * Math.cos(angle), y * Math.sin(angle)];
        }
        group
            .selectAll('.link')
            .data(root.descendants()
                .slice(1))
            .enter()
            .append('path')
            .attr('class', 'link')
            .attr('stroke', lineColor)
            .attr('fill', 'none')
            .attr('stroke-opacity', 0.4)
            .attr('storke-width', 1.5)
            .attr('d', d =>
                `M${project(d.x, d.y)},C${project(d.x, (d.y + d.parent.y) / 2)}` +
                ` ${project(d.parent.x, (d.y + d.parent.y) / 2)} ${project(d.parent.x, d.parent.y)}`);

        const node = group
            .selectAll('.node')
            .data(root.descendants())
            .enter()
            .append('g')
            .attr('class', d => `node ${d.children ? 'node-internal' : 'node-leaf'}`)
            .attr('transform', d => `translate(${project(d.x, d.y)})`);

        node.append('circle')
            .style('fill', '#555')
            .attr('r', 2.5);

        node.append('text')
            .attr('dy', '.31em')
            .attr('x', d => ((d.x < 180) === (!d.children) ? 6 : -6))
            .style('text-anchor', d => ((d.x < 180) === !d.children ? 'start' : 'end'))
            .style('text-shadow', '0 1px 0 #fff, 0 -1px 0 #fff, 1px 0 0 #fff, -1px 0 0 #fff')
            .attr('transform', d => `rotate(${d.x < 180 ? d.x - 90 : d.x + 90})`)
            .text(d => labelAccessor(d.data));
    }
    render() {
        return (
            <svg
                styleName="radialdendrogram"
                ref={(elem) => { this.svg = elem; }}
            />
        );
    }
}
