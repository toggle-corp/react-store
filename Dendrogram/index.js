import React from 'react';
import CSSModules from 'react-css-modules';
import { select } from 'd3-selection';
import { cluster, hierarchy } from 'd3-hierarchy';
import { schemePaired } from 'd3-scale-chromatic';
import { scaleOrdinal } from 'd3-scale';
import { PropTypes } from 'prop-types';
import SvgSaver from 'svgsaver';
import Responsive from '../Responsive';
import styles from './styles.scss';

/**
 * boundingClientRect: the width and height of the container.
 * data: the hierarchical data to be visualized.
 * labelAccessor: returns the individual label from a unit data.
 * colorScheme: the color scheme for links that connect the nodes.
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
    colorScheme: PropTypes.arrayOf(PropTypes.string),
    margins: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
    }),
};

const defaultProps = {
    data: [],
    colorScheme: schemePaired,
    margins: {
        top: 50,
        right: 50,
        bottom: 100,
        left: 100,
    },
};

/**
 * Dendrogram is a tree diagram showing the arrangement of clusters produced by hierarchical
 * clustering.
 */
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

    save = () => {
        const svg = select(this.svg);
        const svgsaver = new SvgSaver();
        svgsaver.asSvg(svg.node(), `dendrogram-${Date.now()}.svg`);
    }
    renderChart() {
        const {
            data,
            boundingClientRect,
            labelAccessor,
            colorScheme,
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

        const colors = scaleOrdinal()
            .range(colorScheme);

        function topicColors(node) {
            let color = colors(0);
            if (node.depth === 0 || node.depth === 1) {
                color = colors(labelAccessor(node.data));
            } else {
                color = topicColors(node.parent);
            }
            return color;
        }

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
            .attr('stroke', topicColors)
            .attr('fill', 'none')
            .attr('stroke-width', 1.5)
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
            .style('fill', topicColors)
            .attr('r', 2.5);

        node.append('text')
            .attr('dy', '.3em')
            .attr('dx', d => (d.children ? -8 : 8))
            .style('fill', topicColors)
            .style('text-anchor', d => (d.children ? 'end' : 'start'))
            .style('text-shadow', '0 1px 0 #fff, 0 -1px 0 #fff, 1px 0 0 #fff, -1px 0 0 #fff')
            .text(d => labelAccessor(d.data));
    }
    render() {
        return (
            <div
                className="dendrogram-container"
                ref={(el) => { this.container = el; }}
            >
                <button className="save-button" onClick={this.save}>
                    Save
                </button>
                <svg
                    className="dendrogram"
                    ref={(elem) => { this.svg = elem; }}
                />
            </div>
        );
    }
}
