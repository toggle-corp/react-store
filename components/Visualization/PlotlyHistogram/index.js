import React from 'react';
import PropTypes from 'prop-types';
import Plot from 'react-plotly.js';

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

    handleHover = (e) => {
        console.warn(e);
    }

    render() {
        const {
            className,
            boundingClientRect: {
                width = 0,
                height = 0,
            } = emptyObject,
            data,
            margins: {
                left: l = 0,
                right: r = 0,
                top: t = 0,
                bottom: b = 0,
            } = emptyObject,
        } = this.props;

        return (
            <Plot
                className={className}
                data={[{
                    type: 'histogram',
                    x: data,
                    marker: {
                        color: currentStyle.colorAccent,
                        opacity: 0.3,
                    },
                }]}
                layout={{
                    width,
                    height,
                    margin: { l, r, t, b },
                }}
                config={{
                    displayModeBar: false,
                }}
            />
        );
    }
}

export default Responsive(PlotlyHistogram);
