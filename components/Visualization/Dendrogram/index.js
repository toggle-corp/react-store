import React from 'react';
import CSSModules from 'react-css-modules';
import { select } from 'd3-selection';
import { cluster, hierarchy } from 'd3-hierarchy';
import { schemePaired } from 'd3-scale-chromatic';
import { scalePow, scaleOrdinal } from 'd3-scale';
import { extent } from 'd3-array';
import { PropTypes } from 'prop-types';
import SvgSaver from 'svgsaver';
import Responsive from '../../General/Responsive';
import styles from './styles.scss';
import { getStandardFilename, isObjectEmpty } from '../../../utils/common';
import LoadingAnimation from '../../View/LoadingAnimation';

/**
 * boundingClientRect: the width and height of the container.
 * data: the hierarchical data to be visualized.
 * childrenAccessor: the accessor function to return array of data representing the children.
 * labelAccessor: accesses the individual label from a unit data.
 * valueAccessor: accesses the value of the unit data.
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
    }).isRequired,
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
    loading: PropTypes.bool,
};

const defaultProps = {
    childrenAccessor: d => d.children,
    valueAccessor: () => 1,
    colorScheme: schemePaired,
    className: '',
    margins: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    },
    loading: false,
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
        svgsaver.asSvg(svg.node(), `${getStandardFilename('dendrogram', 'graph')}.svg`);
    }

    renderChart() {
        const {
            data,
            boundingClientRect,
            childrenAccessor,
            labelAccessor,
            valueAccessor,
            colorScheme,
            margins,
        } = this.props;

        if (!boundingClientRect.width) {
            return;
        }
        if (!data || data.length === 0 || isObjectEmpty(data)) {
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

        const leafTextWidth = 200;
        const rootTextWidth = 80;
        function topicColors(node) {
            let color = colors(0);
            if (node.depth === 0 || node.depth === 1) {
                color = colors(labelAccessor(node.data));
            } else {
                color = topicColors(node.parent);
            }
            return color;
        }

        function diagonal(d) {
            return `M${d.y},${d.x}C${d.parent.y + 100},${d.x}` +
                    ` ${d.parent.y + 100},${d.parent.x} ${d.parent.y},${d.parent.x}`;
        }

        const group = svg
            .attr('width', width + left + right)
            .attr('height', height + top + bottom)
            .append('g')
            .attr('transform', `translate(${rootTextWidth}, ${top})`);
        const tree = cluster()
            .size([height, width - leafTextWidth]);

        const root = hierarchy(data, childrenAccessor)
            .sum(valueAccessor);

        tree(root);

        const minmax = extent(root.descendants(), d => d.value);
        const scaledValues = scalePow().exponent(0.5).domain(minmax).range([4, 20]);

        group
            .selectAll('.link')
            .data(root.descendants().slice(1))
            .enter()
            .append('path')
            .attr('class', 'link')
            .attr('stroke', topicColors)
            .attr('fill', 'none')
            .attr('stroke-width', 1.5)
            .attr('d', diagonal);

        const node = group
            .selectAll('.node')
            .data(root.descendants())
            .enter()
            .append('g')
            .attr('class', d => `node ${d.children ? 'node-internal' : 'node-leaf'}`)
            .attr('transform', d => `translate(${d.y}, ${d.x})`);

        node.append('circle')
            .style('fill', topicColors)
            .attr('r', (d) => {
                if (d.value) {
                    return scaledValues(d.value);
                }
                return 5;
            });

        node.append('text')
            .attr('dy', '.3em')
            .attr('dx', (d) => {
                if (d.value) {
                    return d.children ? `-${scaledValues(d.value) + 2}` : `${scaledValues(d.value) + 2}`;
                }
                return d.children ? -5 : 5;
            })
            .style('fill', topicColors)
            .style('text-anchor', d => (d.children ? 'end' : 'start'))
            .text(d => labelAccessor(d.data));
    }

    render() {
        const { loading } = this.props;

        return (
            <div
                className={`dendrogram-container ${this.props.className}`}
                ref={(el) => { this.container = el; }}
            >
                { loading && <LoadingAnimation /> }
                <svg
                    className="dendrogram"
                    ref={(elem) => { this.svg = elem; }}
                />
            </div>
        );
    }
}
