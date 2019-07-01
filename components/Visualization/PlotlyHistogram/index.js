import React from 'react';
import PropTypes from 'prop-types';
import Plot from 'react-plotly.js';
import memoize from 'memoize-one';

import Responsive from '../../General/Responsive';

import { currentStyle } from '../../../utils/styles';

const propTypes = {
    boundingClientRect: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }).isRequired,
    className: PropTypes.string,
    data: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    margins: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
    }),
};

const defaultProps = {
    className: undefined,
    margins: {
        top: 10,
        right: 20,
        bottom: 30,
        left: 30,
    },
};

const emptyObject = {};

class PlotlyHistogram extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    getPlotData = memoize((data, markerColor, markerOpacity) => ([{
        type: 'histogram',
        x: data,
        marker: {
            color: markerColor,
            opacity: markerOpacity,
        },
    }]))

    getPlotLayout = memoize((width, height, margins) => ({
        width,
        height,
        margin: {
            l: margins.left,
            r: margins.right,
            t: margins.top,
            b: margins.bottom,
        },
    }))

    getPlotConfig = memoize(displayModeBar => ({
        displayModeBar,
    }))

    render() {
        const {
            className,
            boundingClientRect: {
                width = 0,
                height = 0,
            } = emptyObject,
            data,
            margins,
        } = this.props;

        const plotData = this.getPlotData(data, currentStyle.colorAccent, 0.3);
        const plotLayout = this.getPlotLayout(width, height, margins);
        const plotConfig = this.getPlotConfig(false);

        return (
            <Plot
                className={className}
                data={plotData}
                layout={plotLayout}
                config={plotConfig}
            />
        );
    }
}

export default Responsive(PlotlyHistogram);
