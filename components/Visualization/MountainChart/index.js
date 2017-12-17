import React from 'react';
import PropTypes from 'prop-types';
import { Area, Bar, ComposedChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const propTypes = {
    data: PropTypes.array, // eslint-disable-line
    labelFormatter: PropTypes.func.isRequired,
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
            data,
            labelFormatter,
        } = this.props;

        return (
            <ResponsiveContainer width="100%" height="100%" >
                <ComposedChart
                    data={data}
                    labelFormatter={labelFormatter}
                >
                    <defs>
                        <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis dataKey="timestamp" type="number" scale="time" domain={['dataMin', 'dataMax']} tickFormatter={labelFormatter} />
                    <YAxis yAxisId="left" scale="linear" dataKey="value" domain={['dataMin', 'dataMax']} stroke="#8884d8" />
                    <YAxis yAxisId="right" scale="linear" orientation="right" dataKey="volume" domain={['dataMin', 'dataMax']} stroke="#82ca9d" />

                    <Bar yAxisId="right" dataKey="volume" fill="#82ca9d" />
                    <Area yAxisId="left" type="linear" dataKey="value" stroke="#8884d8" fillOpacity={1} fill="url(#colorUv)" />
                    <Tooltip labelFormatter={labelFormatter} />
                    <Legend />
                </ComposedChart>
            </ResponsiveContainer>
        );
    }
}
