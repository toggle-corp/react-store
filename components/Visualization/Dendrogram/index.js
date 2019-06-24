import React from 'react';
import { PropTypes } from 'prop-types';
import { select } from 'd3-selection';
import { extent } from 'd3-array';
import { schemePaired } from 'd3-scale-chromatic';
import {
    cluster,
    hierarchy,
} from 'd3-hierarchy';
import {
    scalePow,
    scaleOrdinal,
} from 'd3-scale';
import { doesObjectHaveNoData } from '@togglecorp/fujs';

import SvgSaver from 'svgsaver';
import Responsive from '../../General/Responsive';
import styles from './styles.scss';
import { getStandardFilename } from '../../../utils/common';

const propTypes = {
    /**
     * Size of the parent element/component (passed by the Responsive hoc)
     */
    boundingClientRect: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }).isRequired,
    /**
     * Hierarchical data structure that can be computed to form a hierarchical layout
     * <a href="https://github.com/d3/d3-hierarchy">d3-hierarchy</a>
     */
    data: PropTypes.shape({
        name: PropTypes.string,
    }).isRequired,
    /**
     * Handle save functionality
     */
    setSaveFunction: PropTypes.func,
    /**
     * Accessor function to return children of node
     */
    childrenSelector: PropTypes.func,
    /**
     * Select label for each node
     */
    labelSelector: PropTypes.func.isRequired,
    /**
     * Select the value of each node
     */
    valueSelector: PropTypes.func,
    /**
     * Array of colors as hex color codes
     */
    colorScheme: PropTypes.arrayOf(PropTypes.string),
    /**
     * Additional css classes passed from parent
     */
    className: PropTypes.string,
    /**
     * Margins for the chart
     */
    margins: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
    }),
};

const defaultProps = {
    childrenSelector: d => d.children,
    setSaveFunction: () => {},
    valueSelector: () => 1,
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
 * Dendrogram is a tree diagram showing the arrangement of
 * clusters produced by hierarchical clustering
 */
class Dendrogram extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        if (props.setSaveFunction) {
            props.setSaveFunction(this.save);
        }
    }

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
        const { labelSelector } = this.props;
        let color = colors(0);
        if (node.depth === 0 || node.depth === 1) {
            color = colors(labelSelector(node.data));
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
        const { labelSelector } = this.props;
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
            .text(d => labelSelector(d.data));
    }

    redrawChart = () => {
        const svg = select(this.svg);
        svg.selectAll('*').remove();
        this.drawChart();
    }

    drawChart = () => {
        const {
            data,
            boundingClientRect,
            childrenSelector,
            valueSelector,
            colorScheme,
            margins,
        } = this.props;

        if (!boundingClientRect.width) {
            return;
        }

        if (!data || data.length === 0 || doesObjectHaveNoData(data)) {
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
        const root = hierarchy(data, childrenSelector)
            .sum(valueSelector);
        const minmax = extent(root.descendants(), d => d.value);
        const scaledValues = scalePow().exponent(0.5).domain(minmax).range([4, 20]);
        tree(root);

        this.addLines(lines, root.descendants().slice(1), colors);
        this.addNodes(nodes, root.descendants());
        const points = nodes.selectAll('g');
        this.addLabels(points, colors, scaledValues);
        this.addCircles(points, colors, scaledValues);
    }

    render() {
        const { className } = this.props;

        const dendrogramStyle = [
            'dendrogram',
            styles.dendrogram,
            className,
        ].join(' ');
        return (
            <svg
                className={dendrogramStyle}
                ref={(elem) => { this.svg = elem; }}
            />
        );
    }
}

export default Responsive(Dendrogram);
