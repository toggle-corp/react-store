import React from 'react';
import CSSModules from 'react-css-modules';
import { select } from 'd3-selection';
import { scaleLinear, scaleOrdinal } from 'd3-scale';
import { schemePaired } from 'd3-scale-chromatic';
import { hierarchy, treemap } from 'd3-hierarchy';
import { format } from 'd3-format';
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

        function text(content) {
            content
                .attr('x', d => x(d.x) + 6)
                .attr('y', d => y(d.y) + 6);
        }

        function rect(shape) {
            shape
                .attr('x', d => x(d.x0))
                .attr('y', d => y(d.y0))
                .attr('width', d => x(d.x1) - x(d.x0))
                .attr('height', d => y(d.y1) - y(d.y0));
        }

        function foreign(object) {
            object
                .attr('x', d => x(d.x0))
                .attr('y', d => y(d.y0))
                .attr('width', d => x(d.x1) - x(d.x0))
                .attr('height', d => y(d.y1) - y(d.y0));
        }

        function name(d) {
            return d.parent ?
                `${name(d.parent)}/${labelAccessor(d.data)}` :
                `${labelAccessor(d.data)}`;
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

            grandparent
                .datum(d.parent)
                .select('rect');

            const group1 = group
                .insert('g', '.grandparent')
                .datum(d)
                .attr('class', 'depth');

            const children = group1
                .selectAll('g')
                .data(d.children)
                .enter()
                .append('g');

            children
                .filter(t => t.children)
                .classed('children', true)
                .on('click', transitions); // eslint-disable-line

            children
                .selectAll('.child')
                .data(t => t.children || [t])
                .enter()
                .append('rect')
                .attr('class', 'child')
                .call(rect);

            children
                .append('rect')
                .attr('class', 'parent')
                .call(rect)
                .append('title')
                .text(t => `${labelAccessor(t.data)}\n${t.value}`);

            children
                .append('foreignObject')
                .call(rect)
                .attr('class', 'foreignobj')
                .append('xhtml:div')
                .attr('dy', '.75em')
                .html(t => `<p class='title'> ${labelAccessor(t.data)}</p>`)
                .attr('class', 'textdiv');

            children
                .selectAll('rect')
                .style('fill', t => color(labelAccessor(t.data)));

            function transitions(t) {
                if (transitioning || !t) return;
                transitioning = true;
                const group2 = display(t);
                const first = group1
                    .transition()
                    .duration(650);
                const second = group2
                    .transition()
                    .duration(650);

                x.domain([t.x0, t.x1]);
                y.domain([t.y0, t.y1]);

                group.style('shape-rendering', null);
                group
                    .selectAll('.depth')
                    .sort((a, b) => a.depth - b.depth);
                group2.selectAll('text')
                    .style('fill-opacity', 0);
                group2.selectAll('foreignObject div')
                    .style('display', 'none');

                first.selectAll('text')
                    .call(text)
                    .style('fill-opacity', 0);
                second.selectAll('text')
                    .call(text)
                    .style('fill-opacity', 1);
                first.selectAll('rect')
                    .call(rect);
                second.selectAll('rect')
                    .call(rect);
                first.selectAll('.textdiv')
                    .style('display', 'none');
                first.selectAll('.foreignobj')
                    .call(foreign);
                second.selectAll('.textdiv')
                    .style('display', 'block');
                second.selectAll('.foreignobj')
                    .call(foreign);

                first
                    .on('end.remove', function clean() {
                        this.remove();
                        transitioning = false;
                    });
            }
            return children;
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
                .text(d => labelAccessor(d.data));
            cell
                .append('title')
                .text(d => `${labelAccessor(d.data)}\n${formats(valueAccessor(d.data))}`);
        }
    }

    render() {
        return (
            <svg
                className="treemap"
                ref={(elem) => { this.svg = elem; }}
            />

        );
    }
}
