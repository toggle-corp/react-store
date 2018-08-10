import React from 'react';
import { select } from 'd3-selection';
import { scaleLinear, scaleOrdinal } from 'd3-scale';
import { schemeSet3 } from 'd3-scale-chromatic';
import { hierarchy, treemap } from 'd3-hierarchy';
import { format } from 'd3-format';
import { hsl, rgb } from 'd3-color';
import { range } from 'd3-array';
import { PropTypes } from 'prop-types';
import SvgSaver from 'svgsaver';
import Responsive from '../../General/Responsive';
import { getStandardFilename, getColorOnBgColor, getHexFromRgb, isObjectEmpty } from '../../../utils/common';

// FIXME: don't use globals
// eslint-disable-next-line no-unused-vars
import styles from './styles.scss';

/**
 * boundingClientRect: the width and height of the container.
 * data: the hierarchical data to be visualized.
 * childrenSelector: the accessor function to return array of data representing the children.
 * labelSelector: returns the individual label from a unit data.
 * valueSelector: return the value for the unit data.
 * colorScheme: PropTypes.arrayOf(PropTypes.string),
 * zoomable: if true the treemap can be zoomed in.(show child elements).
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
    setSaveFunction: PropTypes.func,
    childrenSelector: PropTypes.func,
    valueSelector: PropTypes.func.isRequired,
    labelSelector: PropTypes.func.isRequired,
    colorScheme: PropTypes.arrayOf(PropTypes.string),
    zoomable: PropTypes.bool,
    className: PropTypes.string,
    margins: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
    }),
};

const defaultProps = {
    data: [],
    setSaveFunction: () => {},
    childrenSelector: d => d.children,
    colorScheme: schemeSet3,
    zoomable: true,
    className: '',
    margins: {
        top: 40,
        right: 0,
        bottom: 0,
        left: 0,
    },
};

/**
 * TreeMap shows hierarchical data  as nested rectangles.
 */

class TreeMap extends React.PureComponent {
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
        svgsaver.asSvg(svg.node(), `${getStandardFilename('treemap', 'graph')}.svg`);
    }

    renderChart = () => {
        const {
            data,
            childrenSelector,
            boundingClientRect,
            valueSelector,
            labelSelector,
            colorScheme,
            zoomable,
            margins,
        } = this.props;

        const svg = select(this.svg);
        svg
            .selectAll('*')
            .remove();

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

        const group = svg
            .style('width', width + left + right)
            .style('height', height + top + bottom)
            .style('left', `-${left}px`)
            .style('right', `-${right}px`)
            .append('g')
            .attr('transform', `translate(${left}, ${top})`)
            .style('shape-rendering', 'crispEdges');

        const x = scaleLinear()
            .domain([0, width])
            .range([0, width]);

        const y = scaleLinear()
            .domain([0, height])
            .range([0, height]);

        const saturations = scaleOrdinal()
            .range(range(0.5, 1, 0.1));

        const lightness = scaleOrdinal()
            .range(range(0.5, 1, 0.1));

        const colors = scaleOrdinal()
            .range(colorScheme);

        const formats = format(',d');

        const treemaps = treemap()
            .size([width, height])
            .round(true)
            .padding(d => d.height);

        const root = hierarchy(data, childrenSelector)
            .sum(d => valueSelector(d));

        treemaps(root);

        function getColorShades(value) {
            const color = hsl(colors(labelSelector(value.parent.data)));
            color.s = saturations(labelSelector(value.data));
            color.l = lightness(labelSelector(value.data));
            return color;
        }

        function visibility(t) {
            const textLength = this.getComputedTextLength();
            const elementWidth = (x(t.x1) - x(t.x0)) - 6;
            return textLength < elementWidth ? 1 : 0;
        }

        function parentText(element) {
            element
                .attr('x', d => x(d.x0) + 6)
                .attr('y', d => y(d.y0) + 6)
                .style('opacity', visibility);
        }

        function childText(element) {
            element
                .attr('x', t => x(t.x1) - 6)
                .attr('y', t => y(t.y1) - 6)
                .attr('dy', '-.35em')
                .attr('text-anchor', 'end')
                .style('opacity', visibility);
        }

        function name(d) {
            return d.parent ? `${name(d.parent)}/${labelSelector(d.data)}` : '';
        }

        function rect(shape) {
            shape
                .attr('x', d => x(d.x0))
                .attr('y', d => y(d.y0))
                .attr('width', d => x(d.x1) - x(d.x0))
                .attr('height', d => y(d.y1) - y(d.y0));
        }

        let transitioning = false;

        const grandparent = group
            .append('g')
            .attr('class', 'grandparent');


        function display(d) {
            grandparent
                .datum(d.parent)
                .on('click', transitions) //eslint-disable-line
                .select('text')
                .text(name(d));

            const group1 = group
                .insert('g', '.grandparent')
                .datum(d)
                .attr('class', 'depth');

            const group2 = group1
                .selectAll('g')
                .data(d.children)
                .enter()
                .append('g');

            group2
                .filter(t => t.children)
                .classed('children', true)
                .on('click', transitions); // eslint-disable-line

            const children = group2
                .selectAll('.child')
                .data(t => t.children || [t])
                .enter()
                .append('g');

            children
                .append('rect')
                .attr('class', 'child')
                .call(rect)
                .append('title')
                .text(t => `${labelSelector(t.data)}\n${valueSelector(t.data)}`);

            children
                .append('text')
                .attr('class', 'child-text')
                .text(t => `${labelSelector(t.data)}`)
                .call(childText);

            group2
                .append('rect')
                .attr('class', 'parent')
                .call(rect);

            group2
                .append('text')
                .attr('class', 'parent-text')
                .attr('dy', '.75em')
                .text(t => `${labelSelector(t.data)}`)
                .call(parentText);

            group2
                .selectAll('rect')
                .style('fill', t => getColorShades(t));

            children
                .selectAll('text')
                .style('fill', (t) => {
                    const colorBg = getHexFromRgb(rgb(getColorShades(t)).toString());
                    return getColorOnBgColor(colorBg);
                });

            function transitions(t) {
                if (transitioning || !t) return;
                transitioning = true;
                const childGroup = display(t);

                const first = group1
                    .transition()
                    .duration(650);
                const second = childGroup
                    .transition()
                    .duration(650);

                x.domain([t.x0, t.x1]);
                y.domain([t.y0, t.y1]);

                group.style('shape-rendering', null);
                group
                    .selectAll('.depth')
                    .sort((a, b) => a.depth - b.depth);
                childGroup.selectAll('text')
                    .style('fill-opacity', 0);

                first.selectAll('.parent-text')
                    .call(parentText)
                    .style('fill-opacity', 0);
                second.selectAll('.parent-text')
                    .call(parentText)
                    .style('fill-opacity', 1);
                first.selectAll('.child-text')
                    .call(childText)
                    .style('fill-opacity', 0);
                second.selectAll('.child-text')
                    .call(childText)
                    .style('fill-opacity', 1);
                first.selectAll('rect')
                    .call(rect);
                second.selectAll('rect')
                    .call(rect);

                first
                    .on('end.remove', function clean() {
                        this.remove();
                        transitioning = false;
                    });
            }
            return group2;
        }

        if (zoomable) {
            grandparent
                .append('rect')
                .attr('class', 'navigation')
                .attr('y', -(top))
                .attr('width', width)
                .attr('height', top - 2)
                .attr('fill', colorScheme[0]);

            grandparent
                .append('text')
                .attr('x', top / 2)
                .attr('y', -(top / 2))
                .attr('dy', '.32em');

            display(root);
        } else {
            const cell = group
                .select('g')
                .selectAll('g')
                .data(root.leaves())
                .enter()
                .append('g')
                .attr('transform', d => `translate(${d.x0},${d.y0})`);

            cell.append('rect')
                .attr('id', d => d.data.name)
                .attr('width', d => d.x1 - d.x0)
                .attr('height', d => d.y1 - d.y0)
                .attr('fill', d => colors(labelSelector(d.parent.data)));

            cell.append('text')
                .attr('x', d => (d.x1 - d.x0) / 2)
                .attr('y', d => (d.y1 - d.y0) / 2)
                .attr('text-anchor', 'middle')
                .attr('class', 'text-label')
                .text(d => labelSelector(d.data))
                .style('fill', d => getColorOnBgColor(colors(labelSelector(d.parent.data))))
                .style('opacity', visibility);

            cell
                .append('title')
                .text(d => `${labelSelector(d.data)}\n${formats(valueSelector(d.data))}`);
        }
    }

    render() {
        return (
            <div
                className={`treemap-container ${this.props.className}`}
                ref={(el) => { this.container = el; }}
            >
                <svg
                    className="treemap"
                    ref={(elem) => { this.svg = elem; }}
                />
            </div>
        );
    }
}

export default Responsive(TreeMap);
