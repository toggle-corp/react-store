import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cloud from 'd3-cloud';
import SvgSaver from 'svgsaver';
import { select } from 'd3-selection';
import { scaleOrdinal } from 'd3-scale';
import { schemeSet1 } from 'd3-scale-chromatic';
import { _cs } from '@togglecorp/fujs';
import memoize from 'memoize-one';

import Responsive from '../../General/Responsive';
import { getStandardFilename } from '../../../utils/common';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    boundingClientRect: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }).isRequired,
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
    font: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    rotate: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
    setSaveFunction: PropTypes.func,
    textSelector: PropTypes.func,
    fontSizeSelector: PropTypes.func,
    // onWordMouseOver: PropTypes.func,
    // onWordClick: PropTypes.func,
    colorScheme: PropTypes.arrayOf(PropTypes.string),
};

const defaultProps = {
    className: '',
    font: 'sans-serif',
    rotate: 0,
    setSaveFunction: undefined,
    onWordClick: undefined,
    onWordMouseOver: undefined,
    textSelector: d => d.text,
    fontSizeSelector: d => d.size,
    colorScheme: schemeSet1,
};

const emptyObject = {};
const emptyList = [];

class WordCloud extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        if (props.setSaveFunction) {
            props.setSaveFunction(this.save);
        }

        this.state = {
            calculatedWords: emptyList,
        };

        this.startWordCloudComputation(props);
    }

    componentWillReceiveProps(nextProps) {
        this.startWordCloudComputation(nextProps);
    }

    getColorScale = colorScheme => scaleOrdinal().range(colorScheme);

    startWordCloudComputation = ({
        boundingClientRect: {
            width: containerWidth,
            height: containerHeight,
        } = emptyObject,
        data,
        font,
        rotate,
        textSelector,
        fontSizeSelector,
    }) => {
        const isContainerInvalid = !containerWidth;
        const isDataInvalid = !data || data.length === 0;

        if (isContainerInvalid || isDataInvalid) {
            return;
        }

        this.calculateWordCloud(
            containerWidth,
            containerHeight,
            font,
            data,
            rotate,
            textSelector,
            fontSizeSelector,
        );
    }

    save = () => {
        const { current: svgElement } = this.svgRef;
        const svg = select(svgElement);
        const svgsaver = new SvgSaver();
        svgsaver.asSvg(svg.node(), `${getStandardFilename('wordcloud', 'graph')}.svg`);
    }

    handleWordCloudCalculationEnd = (words) => {
        this.setState({ calculatedWords: words });
    }

    calculateWordCloud = memoize((
        width,
        height,
        font,
        data,
        rotate,
        textSelector,
        sizeSelector,
    ) => {
        this.setState({ calculatedWords: undefined });
        const renderArea = width * height;

        const words = data.map(d => textSelector(d));
        const frequencies = data.map(d => sizeSelector(d));

        const totalLetterLength = words.join(' ').length;

        const minFont = 3;
        const maxFont = Math.max(minFont * 2, Math.sqrt(renderArea / totalLetterLength));
        const maxSize = Math.max(Math.max(...frequencies), 1);

        const renderAreaFactor = renderArea / totalLetterLength;
        const paddingFactor = 5;
        const padding = paddingFactor > 0 ? Math.sqrt(renderAreaFactor) / paddingFactor : 0;

        const sizeOffset = maxFont / maxSize;

        const fontSizeSelector = d => Math.max(3, Math.min(d.size * sizeOffset, maxFont));

        const layout = cloud();
        const layoutData = JSON.parse(JSON.stringify(data));
        layout.size([width, height])
            .font(font)
            .words(layoutData)
            .padding(padding)
            .rotate(rotate)
            .fontSize(fontSizeSelector)
            .text(textSelector)
            .on('end', this.handleWordCloudCalculationEnd);

        setTimeout(layout.start, 0);
    })

    render() {
        const {
            className: classNameFromProps,
            boundingClientRect: {
                width: containerWidth,
                height: containerHeight,
            } = emptyObject,
            data,
            colorScheme,
            font,
            padding,
            rotate,
            fontSizeSelector,
            textSelector,
        } = this.props;

        const isContainerInvalid = !containerWidth;
        const isDataInvalid = !data || data.length === 0;

        if (isContainerInvalid || isDataInvalid) {
            return null;
        }

        const className = _cs(
            classNameFromProps,
            styles.wordCloud,
            'word-cloud',
        );

        /*
        const svgClassName = _cs(
            'svg',
            styles.svg,
        );
        */

        const colorScale = this.getColorScale(colorScheme);
        const { calculatedWords } = this.state;

        return (
            <div
                className={className}
                style={{
                    width: containerWidth,
                    height: containerHeight,
                }}
            >
                { calculatedWords && (
                    <svg
                        // className={svgClassName}
                        width={containerWidth}
                        height={containerHeight}
                        ref={this.svgRef}
                    >
                        <g transform={`translate(${containerWidth / 2}, ${containerHeight / 2})`}>
                            { calculatedWords.map(w => (
                                <text
                                    key={w.text}
                                    style={{
                                        fontSize: w.size,
                                        fontFamily: w.font,
                                    }}
                                    fill={colorScale(w.text)}
                                    textAnchor="middle"
                                    transform={`translate(${w.x}, ${w.y}) rotate(${w.rotate})`}
                                >
                                    { w.text }
                                </text>
                            )) }
                        </g>
                    </svg>
                ) }
            </div>
        );
    }
}

export default Responsive(WordCloud);
