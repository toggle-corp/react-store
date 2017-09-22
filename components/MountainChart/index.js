import React from 'react';
import PropTypes from 'prop-types';
import { AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { timeFormat } from 'd3-time-format';

const propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    data: PropTypes.array,
};
const defaultProps = {
    data: [],
};

export default class MountainChart extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        // Initial state

        console.log(this.props.data);
    }

    render() {
        const {
            width,
            height,
            data,
        } = this.props;

        const dateFormat = time => timeFormat('%d%b')(new Date(time));

        return (
            <AreaChart
                width={width}
                height={height}
                data={data}
            >
                <defs>
                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <XAxis dataKey="timestamp" scale="time" tickFormatter={dateFormat} />
                <YAxis domain={['dataMin', 'dataMax']} />
                <Tooltip labelFormatter={dateFormat} />
                <Area type="linear" dataKey="value" stroke="#8884d8" fillOpacity={1} fill="url(#colorUv)" />
            </AreaChart>
        );
    }
}
