import React, { PureComponent } from 'react';
import CSSModules from 'react-css-modules';
import { PropTypes } from 'prop-types';
import { select, event } from 'd3-selection';
import { scaleOrdinal, schemeCategory20 } from 'd3-scale';
import eventDrops from 'event-drops';
import SvgSaver from 'svgsaver';
import Responsive from '../../General/Responsive';
import styles from './styles.scss';
import { getStandardFilename } from '../../../utils/common';

const propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string,
            data: PropTypes.array,
        }),
    ).isRequired,
    className: PropTypes.string,
    colorScheme: PropTypes.arrayOf(PropTypes.string),
    dateAccessor: PropTypes.func,
    detailAccessor: PropTypes.func,
    isZoomable: PropTypes.bool,
    margins: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
    }),
};

const defaultProps = {
    className: '',
    colorScheme: schemeCategory20,
    dateAccessor: d => d,
    labelAccessor: d => d,
    detailAccessor: d => d,
    isZoomable: false,
    margins: {
        top: 60,
        left: 200,
        bottom: 40,
        right: 50,
    },
};
@Responsive
@CSSModules(styles)
export default class EventDrops extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    componentDidMount() {
        this.renderChart();
    }

    componentDidUpdate() {
        this.renderChart();
    }

    save = () => {
        const svg = select(this.container);
        const svgsaver = new SvgSaver();
        svgsaver.asSvg(svg.node(), getStandardFilename('events', 'svg', new Date()));
    }

    renderChart = () => {
        const {
            data,
            colorScheme,
            dateAccessor,
            detailAccessor,
            isZoomable,
            margins,
        } = this.props;

        const colors = scaleOrdinal()
            .range(colorScheme);

        select(this.container)
            .selectAll('.tooltip')
            .remove();

        const tooltip = select(this.container)
            .append('div')
            .attr('class', 'tooltip')
            .style('position', 'absolute')
            .style('z-index', 10)
            .style('display', 'none');

        const handleMouseOver = (events) => {
            tooltip.html(`<span class="label">${detailAccessor(events)}</span>`);
            return tooltip
                .transition()
                .style('display', 'inline-block')
                .style('top', `${d3.event.pageY - 30}px`) //eslint-disable-line
                .style('left', `${d3.event.pageX + 20}px`); //eslint-disable-line
        };

        const handleMouseOut = () => tooltip
            .transition()
            .style('display', 'none');

        const eventDropsChart = eventDrops()
            .date(dateAccessor)
            .eventLineColor((d, i) => colors(i))
            .zoomable(isZoomable)
            .margin(margins)
            .zoomend(renderData) // eslint-disable-line
            .mouseover(handleMouseOver)
            .mouseout(handleMouseOut);

        var chart = select(this.container) //eslint-disable-line
            .datum(data)
            .call(eventDropsChart);

        const renderData = (values) => {
            const currentScale = chart.scales.x;
            const newScale = event ? event.transform.rescaleX(currentScale) : currentScale; // eslint-disable-line
            values.map(dataRow =>
                chart.visibleDataInRow(dataRow.data, newScale));
        };
    }
    render() {
        return (
            <div
                className={`eventdrops ${this.props.className}`}
                ref={(el) => { this.container = el; }}
            />
        );
    }
}
