import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
import { select } from 'd3-selection';
import { schemeCategory10 } from 'd3-scale';
import eventDrops from 'event-drops';

const propTypes = {
};

const defaultProps = {
};

export default class EventDrops extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    componentDidMount() {
        this.renderChart();
    }

    componentDidUpdate() {
        this.renderChart();
    }
    renderChart = () => {
        const data = [
            { name: 'http requests', data: [new Date('2014/09/15 13:24:54'), new Date('2014/07/15 13:25:03'), new Date('2014/06/15 13:25:05')] },
            { name: 'SQL queries', data: [new Date('2016/01/15 13:24:57'), new Date('2014/03/15 13:25:04'), new Date('2014/05/15 13:25:04')] },
            { name: 'cache invalidations', data: [new Date('2017/09/15 13:25:12')] },
        ];
        const colors = schemeCategory10;
        const eventDropsChart = eventDrops()
            .eventLineColor((d, i) => colors[i])
            .eventColor((d, i) => colors[i]);

        select(this.container)
            .datum(data)
            .call(eventDropsChart);
    }
    render() {
        return (
            <div
                ref={(el) => { this.container = el; }}
                style={{ width: '50%', height: '100%' }}
            />
        );
    }
}
