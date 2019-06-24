import React, {
    PureComponent,
    Fragment,
} from 'react';
import { select } from 'd3-selection';
import { PropTypes } from 'prop-types';
import SvgSaver from 'svgsaver';
import { schemePaired } from 'd3-scale-chromatic';
import {
    scalePoint,
    scaleLinear,
    scaleOrdinal,
} from 'd3-scale';
import { keys } from 'd3-collection';
import { extent } from 'd3-array';
import { axisLeft } from 'd3-axis';
import {
    brushY,
    brushSelection,
} from 'd3-brush';
import { line } from 'd3-shape';

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
     * Data to be visualized. It consists of array of categorical data grouped
     * together.
     * Example: [{ name: "AMC Ambassador Brougham", economy (mpg): 13, cylinders: 8 }, ...]
     * For each variable an axis is created and each item is represented by a line
     */
    data: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string,
        }).isRequired,
    ).isRequired,
    /**
     * Handler function to save the generated svg
     */
    setSaveFunction: PropTypes.func,
    /**
     * Property keys to be ignored when creating axis
     */
    ignoreProperties: PropTypes.arrayOf(PropTypes.string).isRequired,
    /**
     * The label name of group
     */
    labelSelector: PropTypes.func.isRequired,
    /**
     * Color selector for each group
     */
    colorSelector: PropTypes.func,
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
    data: [],
    setSaveFunction: () => {},
    colorScheme: schemePaired,
    colorSelector: undefined,
    className: '',
    margins: {
        top: 40,
        right: 10,
        bottom: 20,
        left: 10,
    },
};
/**
 * Parallel Coordinates visualization is used to compare multivariate numeric data.
 * It can be used to view relationships between variables.
 */
class ParallelCoordinates extends PureComponent {
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
            left,
        } = margins;

        return select(this.svg)
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
            ignoreProperties,
            colorScheme,
        } = this.props;

        let {
            width,
            height,
        } = boundingClientRect;

        const {
            top,
            right,
            bottom,
            left,
        } = margins;

        width = width - left - right;
        height = height - top - bottom;
        this.dimensions = keys(data[0]).filter(d => !ignoreProperties.includes(d));
        this.x = scalePoint()
            .domain(this.dimensions)
            .range([0, width])
            .padding(0.1);
        this.y = {};
        this.dimensions
            .forEach((d) => {
                this.y[d] = scaleLinear()
                    .domain(extent(data, value => value[d]))
                    .range([height, 0]);
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
            labelSelector,
            colorSelector,
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
            .style('stroke', (d) => {
                if (colorSelector) {
                    return colorSelector(d);
                }
                return colors(labelSelector(d));
            })
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
            .style('stroke', (d) => {
                if (colorSelector) {
                    return colorSelector(d);
                }
                return colors(labelSelector(d));
            })
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
            .attr('class', `${styles.axis} axis`)
            .each((d, i, nodes) => select(nodes[i]).call(axisLeft(y[d])))
            .append('text')
            .attr('class', `${styles.text} text`)
            .attr('y', -10)
            .attr('text-anchor', 'middle')
            .text(d => d);

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
            'parallel-coordiantes',
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

export default Responsive(ParallelCoordinates);
