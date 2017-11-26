import React from 'react';
import CSSModules from 'react-css-modules';
import { select } from 'd3-selection';
import { scaleLinear, scaleOrdinal } from 'd3-scale';
import { schemePaired } from 'd3-scale-chromatic';
import { hierarchy, treemap } from 'd3-hierarchy';
import { format } from 'd3-format';
import { PropTypes } from 'prop-types';
import SvgSaver from 'svgsaver';
import Responsive from '../Responsive';
import styles from './styles.scss';

/**
 * boundingClientRect: the width and height of the container.
 * data: the hierarchical data to be visualized.
 * labelAccessor: returns the individual label from a unit data.
 * valueAccessor: return the value for the unit data.
 * zoomable: if true the treemap can be zoomed in.(show child elements).
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
    valueAccessor: PropTypes.func.isRequired,
    labelAccessor: PropTypes.func.isRequired,
    zoomable: PropTypes.bool,
    margins: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
    }),
};

const defaultProps = {
    data: [],
    zoomable: true,
    margins: {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50,
    },
};

/**
 * TreeMap shows hierarchical data  as nested rectangles.
 */
@Responsive
@CSSModules(styles)
export default class TreeMap extends React.PureComponent {
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
        svgsaver.asSvg(svg.node(), `treemap-${Date.now()}.svg`);
    }

    renderChart() {
        const {
            data,
            boundingClientRect,
            valueAccessor,
            labelAccessor,
            zoomable,
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
        svg.selectAll('*')
            .remove();

        width = width - left - right;
        height = height - top - bottom;

        const group = svg
            .attr('width', width + left + right)
            .attr('height', height + top + bottom)
            .append('g')
            .attr('transform', `translate(${left}, ${top})`);

        const x = scaleLinear()
            .domain([0, width])
            .range([0, width]);

        const y = scaleLinear()
            .domain([0, height])
            .range([0, height]);

        const color = scaleOrdinal()
            .range(schemePaired);
        const formats = format(',d');

        const treemaps = treemap()
            .size([width, height])
            .round(true)
            .paddingInner(1);

        const root = hierarchy(data)
            .sum(d => valueAccessor(d));

        treemaps(root);

        function visibility(t) {
            const textLength = this.getComputedTextLength();
            const elementWidth = (x(t.x1) - x(t.x0)) + 6;
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
                .attr('x', t => x(t.x1))
                .attr('y', t => y(t.y1))
                .attr('dy', '-.35em')
                .attr('text-anchor', 'end')
                .style('opacity', visibility);
        }

        function name(d) {
            return d.parent ? `${name(d.parent)}${labelAccessor(d.data)}` : '';
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
                .text(t => `${labelAccessor(t.data)}`);

            children
                .append('text')
                .attr('class', 'child-text')
                .text(t => `${labelAccessor(t.data)}`)
                .call(childText);

            group2
                .append('rect')
                .attr('class', 'parent')
                .call(rect)
                .append('title')
                .text(t => `${labelAccessor(t.data)}\n${t.value}`);

            group2
                .append('text')
                .attr('class', 'parent-text')
                .attr('dy', '.75em')
                .text(t => `${labelAccessor(t.data)}`)
                .call(parentText);

            group2
                .selectAll('rect')
                .style('fill', t => color(labelAccessor(t.data)));

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
                first.selectAll('.child-text')
                    .call(childText)
                    .style('fill-opacity', 0);
                second.selectAll('.parent-text')
                    .call(parentText)
                    .style('fill-opacity', 1);
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
                .attr('y', -top)
                .attr('width', width)
                .attr('height', top);

            grandparent
                .append('text')
                .attr('x', top / 2)
                .attr('y', -(top / 2))
                .attr('dy', '.32em');

            display(root);
        } else {
            const cell = grandparent
                .selectAll('g')
                .data(root.leaves())
                .enter()
                .append('g')
                .attr('transform', d => `translate(${d.x0},${d.y0})`);

            cell.append('rect')
                .attr('id', d => d.data.name)
                .attr('width', d => d.x1 - d.x0)
                .attr('height', d => d.y1 - d.y0)
                .attr('fill', d => color(labelAccessor(d.parent.data)));

            cell.append('text')
                .attr('x', d => (d.x1 - d.x0) / 2)
                .attr('y', d => (d.y1 - d.y0) / 2)
                .attr('text-anchor', 'middle')
                .attr('class', 'text-label')
                .text(d => labelAccessor(d.data))
                .style('opacity', visibility);

            cell
                .append('title')
                .text(d => `${labelAccessor(d.data)}\n${formats(valueAccessor(d.data))}`);
        }
    }

    render() {
        return (
            <div
                className="treemap-container"
                ref={(el) => { this.container = el; }}
            >
                <button className="save-button" onClick={this.save}>
                    Save
                </button>
                <svg
                    className="treemap"
                    ref={(elem) => { this.svg = elem; }}
                />
            </div>
        );
    }
}
