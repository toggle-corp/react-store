import React from 'react';
import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import { select } from 'd3-selection';
import SvgSaver from 'svgsaver';
import { summaryTiles } from 'd3-summary-tiles';
import Responsive from '../../General/Responsive';
import styles from './styles.scss';
import { getStandardFilename } from '../../../utils/common';

const propTypes = {
    className: PropTypes.string,
    boundingClientRect: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }).isRequired,
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
    xAccessor: PropTypes.string.isRequired,
    yAccessor: PropTypes.string.isRequired,
    valueAccessor: PropTypes.string.isRequired,
    reverseColorScheme: PropTypes.bool,
    title: PropTypes.string,
    legendTitle: PropTypes.string,
    xLabel: PropTypes.string,
    yLabel: PropTypes.string,
    colorScheme: PropTypes.string,
    verticalLegend: PropTypes.bool,
    showTooltip: PropTypes.bool,
    padding: PropTypes.number,
};

const defaultProps = {
    className: '',
    asCorrelationMatrix: false,
    reverseColorScheme: false,
    title: '',
    legendTitle: '',
    xLabel: '',
    yLabel: '',
    colorScheme: 'Viridis',
    verticalLegend: false,
    showTooltip: true,
    padding: 140,
};
@Responsive
@CSSModules(styles)
export default class SummaryTiles extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    componentDidMount() {
        this.renderChart();
    }

    componentDidUpdate() {
        this.renderChart();
    }

    save = () => {
        const graph = select(this.graph);
        const svgsaver = new SvgSaver();
        svgsaver.asSvg(graph.node(), `${getStandardFilename('summary-tiles', 'graph')}.svg`);
    }

    renderChart() {
        const {
            boundingClientRect,
            data,
            xAccessor,
            yAccessor,
            valueAccessor,
            reverseColorScheme,
            title,
            legendTitle,
            xLabel,
            yLabel,
            colorScheme,
            verticalLegend,
            showTooltip,
            padding,
        } = this.props;

        if (!boundingClientRect.width) {
            return;
        }

        let { width, height } = boundingClientRect;

        width -= padding;
        height -= padding;

        const uniqueX = [...new Set(data.map(item => item[xAccessor]))];
        const uniqueY = [...new Set(data.map(item => item[yAccessor]))];

        const lengthX = uniqueX.length;
        const lengthY = uniqueY.length;

        const tileWidth = width / lengthX;
        const tileHeight = height / lengthY;

        let tiles = summaryTiles()
            .data(data)
            .x(xAccessor)
            .y(yAccessor)
            .fill(valueAccessor)
            .tileWidth(tileWidth)
            .tileHeight(tileHeight)
            .colorScheme(colorScheme)
            .title(title)
            .legendTitle(legendTitle)
            .xLabel(xLabel)
            .yLabel(yLabel);

        if (reverseColorScheme) {
            tiles = tiles.reverseColorScale();
        }
        if (verticalLegend) {
            tiles = tiles.verticalLegend();
        }
        if (!showTooltip) {
            tiles = tiles.noTooltip();
        }

        select(this.graph)
            .selectAll('*').remove();
        select(this.graph)
            .call(tiles);
    }

    render() {
        return (
            <div
                className={`summary-tiles-container ${this.props.className}`}
            >
                <div
                    className="summary-tiles"
                    ref={(elem) => { this.graph = elem; }}
                />
            </div>
        );
    }
}
