import React from 'react';
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
export default class Dendrogram extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    componentDidMount() {
        this.drawChart();
    }

    componentDidUpdate() {
        this.redrawChart();
    }

    setContext = (width, height, margins) => {
        const {
            top,
            right,
            bottom,
            left,
        } = margins;

        return select(this.svg)
            .attr('width', width + left + right)
            .attr('height', height + top + bottom)
            .append('g')
            .attr('transform', `translate(${80 + left}, ${top})`);
    }

    save = () => {
        const svg = select(this.svg);
        const svgsaver = new SvgSaver();
        svgsaver.asSvg(svg.node(), `${getStandardFilename('dendrogram', 'graph')}.svg`);
    }

    topicColors = (node, colors) => {
        const { labelAccessor } = this.props;
        let color = colors(0);
        if (node.depth === 0 || node.depth === 1) {
            color = colors(labelAccessor(node.data));
        } else {
            color = this.topicColors(node.parent, colors);
        }
        return color;
    }

    diagonal = d => (
        `M${d.y},${d.x}C${d.parent.y + 100},${d.x}` +
        ` ${d.parent.y + 100},${d.parent.x} ${d.parent.y},${d.parent.x}`
    )

    addLines = (element, data, colors) => {
        element
            .selectAll('path')
            .data(data)
            .enter()
            .append('path')
            .attr('d', this.diagonal)
            .style('stroke', d => this.topicColors(d, colors))
            .style('stroke-opacity', 0.5)
            .style('fill', 'none')
            .style('stroke-width', 1.5);
    }

    addNodes = (element, data) => (
        element
            .selectAll('g')
            .data(data)
            .enter()
            .append('g')
            .attr('transform', d => `translate(${d.y}, ${d.x})`)
    )

    addCircles = (selection, colors, scaledValues) => {
        selection
            .append('circle')
            .attr('r', (d) => {
                if (d.value) {
                    return scaledValues(d.value);
                }
                return 5;
            })
            .style('fill', d => this.topicColors(d, colors));
    }

    addLabels = (selection, colors, scaledValues) => {
        const { labelAccessor } = this.props;
        selection
            .append('text')
            .attr('dy', '.3em')
            .attr('dx', (d) => {
                if (d.value) {
                    return d.children ? `-${scaledValues(d.value) + 2}` : `${scaledValues(d.value) + 2}`;
                }
                return d.children ? -5 : 5;
            })
            .style('fill', d => this.topicColors(d, colors))
            .style('text-anchor', d => (d.children ? 'end' : 'start'))
            .text(d => labelAccessor(d.data));
    }

    redrawChart = () => {
        const context = select(this.svg);
        context.selectAll('*').remove();
        this.drawChart();
    }

    drawChart = () => {
        const {
            data,
            boundingClientRect,
            childrenAccessor,
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

        width = width - left - right;
        height = height - top - bottom;

        const context = this.setContext(width, height, margins);
        const lines = context.append('g').attr('class', 'lines');
        const nodes = context.append('g').attr('class', 'nodes');
        const colors = scaleOrdinal().range(colorScheme);

        const tree = cluster()
            .size([height, width - 200]);
        const root = hierarchy(data, childrenAccessor)
            .sum(valueAccessor);
        const minmax = extent(root.descendants(), d => d.value);
        const scaledValues = scalePow().exponent(0.5).domain(minmax).range([4, 20]);
        tree(root);

        this.addLines(lines, root.descendants().slice(1), colors);
        const points = this.addNodes(nodes, root.descendants());
        this.addLabels(points, colors, scaledValues);
        this.addCircles(points, colors, scaledValues);
    }

    render() {
        const { loading, className } = this.props;

        const containerStyle = `${styles['dendrogram-container']} ${className}`;
        const dendroGramStyle = `${styles.dendrogram}`;
        return (
            <div
                className={containerStyle}
                ref={(el) => { this.container = el; }}
            >
                { loading && <LoadingAnimation /> }
                <svg
                    className={dendroGramStyle}
                    ref={(elem) => { this.svg = elem; }}
                />
            </div>
        );
    }
}
