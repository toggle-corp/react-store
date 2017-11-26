import React from 'react';
import CSSModules from 'react-css-modules';
import { select } from 'd3-selection';
import { tree, hierarchy } from 'd3-hierarchy';
import { PropTypes } from 'prop-types';
import SvgSaver from 'svgsaver';
import Responsive from '../Responsive';
import styles from './styles.scss';

/**
 * boundingClientRect: the width and height of the container.
 * data: the hierarchical data to be visualized.
 * labelAccessor: returns the individual label from a unit data.
 * lineColor: the color for the line connecting nodes.
 * margins: the margin object with properties for the four sides(clockwise from top).
 */
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

/**
 * RadialDendrogram is a tree diagram showing the arrangement of clusters produced by hierarchical
 * clustering. The clusters are arranged in circle.
 */
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

    save = () => {
        const svg = select(this.svg);
        const svgsaver = new SvgSaver();
        svgsaver.asSvg(svg.node(), `radialdendrogram-${Date.now()}.svg`);
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
            .size([360, radius - 20])
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
            .attr('dy', '.3em')
            .attr('x', d => ((d.x < 180) === (!d.children) ? 6 : -6))
            .style('text-anchor', d => ((d.x < 180) === !d.children ? 'start' : 'end'))
            .style('text-shadow', '0 1px 0 #fff, 0 -1px 0 #fff, 1px 0 0 #fff, -1px 0 0 #fff')
            .attr('transform', d => `rotate(${d.x < 180 ? d.x - 90 : d.x + 90})`)
            .text(d => labelAccessor(d.data));
    }
    render() {
        return (
            <div
                className="radialdendrogram-container"
                ref={(el) => { this.container = el; }}
            >
                <button className="save-button" onClick={this.save}>
                    Save
                </button>
                <svg
                    className="radialdendrogram"
                    ref={(elem) => { this.svg = elem; }}
                />
            </div>
        );
    }
}
