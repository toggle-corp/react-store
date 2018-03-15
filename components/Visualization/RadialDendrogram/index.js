import React from 'react';
import { select } from 'd3-selection';
import { tree, hierarchy } from 'd3-hierarchy';
import { extent } from 'd3-array';
import { schemePaired } from 'd3-scale-chromatic';
import { scalePow, scaleOrdinal } from 'd3-scale';
import { PropTypes } from 'prop-types';
import SvgSaver from 'svgsaver';
import Responsive from '../../General/Responsive';
import { getStandardFilename, isObjectEmpty } from '../../../utils/common';

// FIXME: don't use globals
// eslint-disable-next-line no-unused-vars
import styles from './styles.scss';
/**
 * boundingClientRect: the width and height of the container.
 * data: the hierarchical data to be visualized.
 * childrenAccessor: the accessor function to return array of data representing the children.
 * labelAccessor: returns the individual label from a unit data.
 * colorScheme: the color scheme for links that connect the nodes.
 * className: additional class name for styling.
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
    childrenAccessor: PropTypes.func,
    labelAccessor: PropTypes.func.isRequired,
    valueAccessor: PropTypes.func,
    colorScheme: PropTypes.arrayOf(PropTypes.string),
    className: PropTypes.string,
    margins: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
    }),
};

const defaultProps = {
    childrenAccessor: d => d.children,
    data: [],
    valueAccessor: () => 1,
    colorScheme: schemePaired,
    className: '',
    margins: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    },
};

/**
 * RadialDendrogram is a tree diagram showing the arrangement of clusters produced by hierarchical
 * clustering. The clusters are arranged in circle.
 */
@Responsive
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
        svgsaver.asSvg(svg.node(), `${getStandardFilename('radialdendrogram', 'graph')}.svg`);
    }

    renderChart() {
        const {
            data,
            boundingClientRect,
            childrenAccessor,
            valueAccessor,
            labelAccessor,
            colorScheme,
            margins,
        } = this.props;

        const svg = select(this.svg);
        svg.selectAll('*').remove();

        if (!boundingClientRect.width) {
            return;
        }
        let { width, height } = boundingClientRect;

        if (!data || data.length === 0 || isObjectEmpty(data)) {
            return;
        }

        const {
            top,
            right,
            bottom,
            left,
        } = margins;

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
            .attr('transform', `translate(${((width + left + right) / 2)}, ${((height + top + bottom) / 2)})`);

        const radius = width < height ? width / 2 : height / 2;
        const leafTextWidth = 50;

        const trees = tree()
            .size([360, radius - leafTextWidth])
            .separation((a, b) => ((a.parent === b.parent ? 1 : 2) / a.depth));

        const root = hierarchy(data, childrenAccessor)
            .sum(valueAccessor);
        trees(root);

        const minmax = extent(root.descendants(), d => d.value);
        const scaledValues = scalePow().exponent(0.5).domain(minmax).range([4, 10]);

        function project(x, y) {
            const angle = ((x - 90) / 180) * Math.PI;
            return [y * Math.cos(angle), y * Math.sin(angle)];
        }

        function diagonal(d) {
            return `M${project(d.x, d.y)},C${project(d.x, (d.y + d.parent.y) / 2)}` +
                   ` ${project(d.parent.x, (d.y + d.parent.y) / 2)} ${project(d.parent.x, d.parent.y)}`;
        }

        group
            .selectAll('.link')
            .data(root.descendants()
                .slice(1))
            .enter()
            .append('path')
            .attr('class', 'link')
            .attr('stroke', topicColors)
            .attr('fill', 'none')
            .attr('storke-width', 1.5)
            .attr('d', diagonal);

        const node = group
            .selectAll('.node')
            .data(root.descendants())
            .enter()
            .append('g')
            .attr('class', d => `node ${d.children ? 'node-internal' : 'node-leaf'}`)
            .attr('transform', d => `translate(${project(d.x, d.y)})`);

        node.append('circle')
            .style('fill', topicColors)
            .attr('r', (d) => {
                if (d.value) {
                    return scaledValues(d.value);
                }
                return 3;
            });

        node.append('text')
            .attr('dy', '.3em')
            .style('fill', topicColors)
            .attr('x', d =>
                ((d.x < 180) === (!d.children) ?
                    `${scaledValues(d.value) + 4}` : `-${scaledValues(d.value) + 4}`))
            .style('text-anchor', d => ((d.x < 180) === !d.children ? 'start' : 'end'))
            .style('text-shadow', '0 1px 0 #fff, 0 -1px 0 #fff, 1px 0 0 #fff, -1px 0 0 #fff')
            .attr('transform', d => `rotate(${d.x < 180 ? d.x - 90 : d.x + 90})`)
            .text(d => labelAccessor(d.data));
    }

    render() {
        return (
            <div
                className={`radialdendrogram-container ${this.props.className}`}
                ref={(el) => { this.container = el; }}
            >
                <svg
                    className="radialdendrogram"
                    ref={(elem) => { this.svg = elem; }}
                />
            </div>
        );
    }
}
