import React from 'react';
import { select } from 'd3-selection';
import { tree, hierarchy } from 'd3-hierarchy';
import { extent } from 'd3-array';
import { schemePaired } from 'd3-scale-chromatic';
import { scalePow, scaleOrdinal } from 'd3-scale';
import { PropTypes } from 'prop-types';
import SvgSaver from 'svgsaver';
import { doesObjectHaveNoData } from '@togglecorp/fujs';

import Responsive from '../../General/Responsive';
import { getStandardFilename } from '../../../utils/common';

import styles from './styles.scss';

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
    data: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    /**
     * Handle save functionality
     */
    setSaveFunction: PropTypes.func,
    /**
     * Accessor function to return children of node
     */
    childrenSelector: PropTypes.func,
    /**
     * Accessor function to return children of node
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
    data: [],
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
 * RadialDendrogram is a tree diagram showing the arrangement of clusters produced by hierarchical
 * clustering. The clusters are arranged in circle.
 */
class RadialDendrogram extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        if (props.setSaveFunction) {
            props.setSaveFunction(this.save);
        }
    }

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
            childrenSelector,
            valueSelector,
            labelSelector,
            colorScheme,
            margins,
        } = this.props;

        const svg = select(this.svg);
        svg.selectAll('*').remove();

        if (!boundingClientRect.width) {
            return;
        }
        let { width, height } = boundingClientRect;

        if (!data || data.length === 0 || doesObjectHaveNoData(data)) {
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
            // let color = colors(0);
            let color;
            if (node.depth === 0 || node.depth === 1) {
                color = colors(labelSelector(node.data));
            } else {
                color = topicColors(node.parent);
            }
            return color;
        }

        const group = svg
            .append('g')
            .attr('transform', `translate(${((width + left + right) / 2)}, ${((height + top + bottom) / 2)})`);

        const radius = width < height ? width / 2 : height / 2;
        const leafTextWidth = 50;

        const trees = tree()
            .size([360, radius - leafTextWidth])
            .separation((a, b) => ((a.parent === b.parent ? 1 : 2) / a.depth));

        const root = hierarchy(data, childrenSelector)
            .sum(valueSelector);
        trees(root);

        const minmax = extent(root.descendants(), d => d.value);
        const scaledValues = scalePow().exponent(0.5).domain(minmax).range([4, 10]);

        function project(x, y) {
            const angle = ((x - 90) / 180) * Math.PI;
            return [y * Math.cos(angle), y * Math.sin(angle)];
        }

        function diagonal(d) {
            return `M${project(d.x, d.y)},C${project(d.x, (d.y + d.parent.y) / 2)}`
                + ` ${project(d.parent.x, (d.y + d.parent.y) / 2)} ${project(d.parent.x, d.parent.y)}`;
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
            .attr('x', d => ((d.x < 180) === (!d.children) ? `${scaledValues(d.value) + 4}` : `-${scaledValues(d.value) + 4}`))
            .style('text-anchor', d => ((d.x < 180) === !d.children ? 'start' : 'end'))
            .style('text-shadow', '0 1px 0 #fff, 0 -1px 0 #fff, 1px 0 0 #fff, -1px 0 0 #fff')
            .attr('transform', d => `rotate(${d.x < 180 ? d.x - 90 : d.x + 90})`)
            .text(d => labelSelector(d.data));
    }

    render() {
        const {
            className,
            boundingClientRect: {
                width,
                height,
            },
        } = this.props;

        const radialDendrogramStyle = [
            'radial-dendrogram',
            styles.radialDendrogram,
            className,
        ].join(' ');
        return (
            <svg
                className={radialDendrogramStyle}
                style={{
                    width,
                    height,
                }}
                ref={(elem) => { this.svg = elem; }}
            />
        );
    }
}

export default Responsive(RadialDendrogram);
