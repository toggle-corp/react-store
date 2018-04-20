import React, {
    PureComponent,
    Fragment,
} from 'react';
import { select } from 'd3-selection';
import { PropTypes } from 'prop-types';
import SvgSaver from 'svgsaver';
import { schemePaired } from 'd3-scale-chromatic';
import { scalePoint, scaleLinear, scaleOrdinal } from 'd3-scale';
import { keys } from 'd3-collection';
import { extent } from 'd3-array';
import { axisLeft } from 'd3-axis';
import { brushY, brushSelection } from 'd3-brush';
import { line } from 'd3';

import Responsive from '../../General/Responsive';
import BoundError from '../../General/BoundError';

import { getStandardFilename } from '../../../utils/common';
import styles from './styles.scss';

const propTypes = {
    boundingClientRect: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }).isRequired,
    data: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string,
        }).isRequired,
    ).isRequired,
    labelName: PropTypes.string.isRequired,
    labelAccessor: PropTypes.func.isRequired,
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
    data: [],
    colorScheme: schemePaired,
    className: '',
    margins: {
        top: 40,
        right: 10,
        bottom: 20,
        left: 10,
    },
};

@BoundError()
@Responsive
export default class ParallelCoordinates extends PureComponent {
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
            .attr('transform', `translate(${left}, ${top})`);
    }

    save = () => {
        const svg = select(this.svg);
        const svgsaver = new SvgSaver();
        svgsaver.asSvg(svg.node(), `${getStandardFilename('parallel-coordiantes', 'graph')}.svg`);
    }

    init = () => {
        const {
            margins,
            boundingClientRect,
            data,
            labelName,
            colorScheme,
        } = this.props;

        const {
            width,
            height,
        } = boundingClientRect;

        const {
            top,
            right,
            bottom,
            left,
        } = margins;

        this.width = width - left - right;
        this.height = height - top - bottom;
        this.dimensions = keys(data[0]).filter(d => d !== labelName);
        this.x = scalePoint()
            .domain(this.dimensions)
            .range([0, this.width])
            .padding(0.1);
        this.y = {};
        this.dimensions
            .forEach((d) => {
                this.y[d] = scaleLinear()
                    .domain(extent(data, value => value[d]))
                    .range([this.height, 0]);
                this.y[d].brush = brushY()
                    .extent([[-10, this.y[d].range()[1]], [10, this.y[d].range()[0]]])
                    .on('brush', this.brush);
            });
        this.colors = scaleOrdinal()
            .range(colorScheme);
    }

    path = (d) => {
        const data = this.dimensions.map(p => [this.x(p), this.y[p](d[p])]);
        const lineGenerator = line()
            .x(t => t[0])
            .y(t => t[1]);
        return lineGenerator(data);
    };

    brush = () => {
        const svg = select(this.svg);
        const actives = [];

        svg
            .selectAll('.brush')
            .filter((d, i, nodes) => brushSelection(select(nodes[i]).node()))
            .each((d, i, nodes) => {
                actives.push({
                    dimension: d,
                    extent: brushSelection(select(nodes[i]).node()),
                });
            });

        svg
            .selectAll('.fg')
            .style('display', (d) => {
                const show = !actives.every((active) => {
                    const dim = active.dimension;
                    return active.extent[0] <= this.y[dim](d[dim])
                        && this.y[dim](d[dim]) <= active.extent[1];
                });
                return show ? 'none' : null;
            });
    }

    drawChart = () => {
        const {
            data,
            boundingClientRect,
            labelAccessor,
            margins,
        } = this.props;

        if (!boundingClientRect.width || !data || data.length === 0) {
            return;
        }
        this.init();

        const {
            width,
            height,
            dimensions,
            x,
            y,
            path,
            colors,
        } = this;

        const group = this.setContext(width, height, margins);

        group
            .append('g')
            .attr('class', 'background')
            .selectAll('.bg')
            .data(data)
            .enter()
            .append('path')
            .attr('class', 'bg')
            .style('fill', 'none')
            .style('stroke', d => colors(labelAccessor(d)))
            .style('stroke-opacity', 0.2)
            .attr('d', path);

        group
            .append('g')
            .attr('class', 'foreground')
            .selectAll('.fg')
            .data(data)
            .enter()
            .append('path')
            .attr('class', 'fg')
            .style('stroke', d => colors(labelAccessor(d)))
            .style('fill', 'none')
            .attr('d', path);

        const axes = group
            .selectAll('.dimensions')
            .data(dimensions)
            .enter()
            .append('g')
            .attr('class', 'dimensions')
            .attr('transform', d => `translate(${x(d)})`);

        axes
            .append('g')
            .attr('class', styles.axis)
            .each((d, i, nodes) => select(nodes[i]).call(axisLeft(y[d])))
            .append('text')
            .attr('y', -10)
            .attr('text-anchor', 'middle')
            .text(d => d)
            .style('font-size', '1.5em')
            .style('fill', '#000');

        axes
            .append('g')
            .attr('class', 'brush')
            .each((d, i, nodes) => {
                select(nodes[i])
                    .call(this.y[d].brush);
            })
            .selectAll('rect')
            .attr('x', -10)
            .attr('width', 20);
    }

    redrawChart = () => {
        const svg = select(this.svg);
        svg.selectAll('*').remove();
        this.drawChart();
    }

    render() {
        const {
            className,
        } = this.props;

        const svgClassName = [
            styles.parallel,
            className,
        ].join(' ');

        return (
            <Fragment>
                <svg
                    ref={(elem) => { this.svg = elem; }}
                    className={svgClassName}
                />
            </Fragment>
        );
    }
}
