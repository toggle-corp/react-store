import React, {
    PureComponent,
} from 'react';
import { select } from 'd3-selection';
import { extent } from 'd3-array';
import { scaleLinear } from 'd3-scale';
import { PropTypes } from 'prop-types';
import { line, area } from 'd3-shape';
import SvgSaver from 'svgsaver';
import Responsive from '../../General/Responsive';

import { getStandardFilename } from '../../../utils/common';

import styles from './styles.scss';

const propTypes = {
    boundingClientRect: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }).isRequired,
    data: PropTypes.arrayOf(PropTypes.object),
    valueAccessor: PropTypes.func.isRequired,
    fill: PropTypes.bool,
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
    fill: false,
    className: '',
    margins: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    },
};

class SparkLines extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    componentDidMount() {
        this.drawChart();
    }

    componentDidUpdate() {
        this.redrawChart();
    }

    save = () => {
        const svg = select(this.svg);
        const svgsaver = new SvgSaver();
        svgsaver.asSvg(svg.node(), `${getStandardFilename('sparklines', 'graph')}.svg`);
    }

    drawChart = () => {
        const {
            data,
            boundingClientRect,
            margins,
            fill,
            valueAccessor,
        } = this.props;

        if (!boundingClientRect.width || !data || data.length === 0) {
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

        const group = select(this.svg)
            .attr('width', width + left + right)
            .attr('height', height + top + bottom)
            .append('g')
            .attr('class', styles.sparkLine)
            .attr('transform', `translate(${left}, ${top})`);

        const scaleX = scaleLinear()
            .range([0, width])
            .domain([0, data.length - 1]);

        const scaleY = scaleLinear()
            .range([height, 0])
            .domain(extent(data.map(d => valueAccessor(d))));

        const areas = area()
            .x((d, i) => scaleX(i))
            .y0(height)
            .y1(d => scaleY(valueAccessor(d)));

        const lines = line()
            .x((d, i) => scaleX(i))
            .y(d => scaleY(valueAccessor(d)));

        if (fill) {
            group.append('path')
                .attr('class', styles.area)
                .datum(data)
                .attr('d', areas);
        }

        group
            .append('path')
            .attr('class', styles.path)
            .datum(data)
            .attr('d', lines)
            .style('fill', 'none');
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

        const sparkLinesStyle = [
            'spark-lines',
            styles.sparkLines,
            className,
        ].join(' ');

        return (
            <svg
                ref={(element) => { this.svg = element; }}
                className={sparkLinesStyle}
            />
        );
    }
}

export default Responsive(SparkLines);
