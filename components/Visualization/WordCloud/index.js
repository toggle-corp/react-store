import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cloud from 'd3-cloud';
import SvgSaver from 'svgsaver';
import { select } from 'd3-selection';
import { scaleOrdinal } from 'd3-scale';
import { schemeSet2 } from 'd3-scale-chromatic';
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
    labelSelector: PropTypes.func,
    frequencySelector: PropTypes.func,

    font: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    rotate: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
    setSaveFunction: PropTypes.func,
    // onWordMouseOver: PropTypes.func,
    // onWordClick: PropTypes.func,
    colorScheme: PropTypes.arrayOf(PropTypes.string),
};

const defaultProps = {
    className: '',
    font: 'sans-serif',
    // rotate: () => (Math.floor(Math.random() * 2) * 90),
    rotate: 0,
    setSaveFunction: undefined,
    onWordClick: undefined,
    onWordMouseOver: undefined,
    labelSelector: d => d.text,
    frequencySelector: d => d.size,
    colorScheme: schemeSet2,
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
        labelSelector,
        frequencySelector,
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
            labelSelector,
            frequencySelector,
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
        labelSelector,
        frequencySelector,
    ) => {
        this.setState({ calculatedWords: undefined });

        const words = data.map(labelSelector);
        const frequencies = data.map(frequencySelector);

        const renderArea = width * height;
        const totalLetterLength = words.join(' ').length;
        const renderAreaFactor = renderArea / totalLetterLength;

        const minFont = 7;
        const maxFont = Math.max(
            2 * minFont,
            Math.sqrt(renderAreaFactor),
        );

        /*
        const paddingFactor = 5;
        const padding = paddingFactor > 0
            ? Math.sqrt(renderAreaFactor) / paddingFactor
            : 0;
        */

        const maxSize = Math.max(...frequencies, 1);
        const sizeOffset = maxFont / maxSize;
        const fontSizeSelector = d => Math.max(
            minFont,
            Math.min(frequencySelector(d) * sizeOffset, maxFont),
        );

        const layoutData = JSON.parse(JSON.stringify(data));

        const layout = cloud();
        layout.size([width, height])
            .font(font)
            .words(layoutData)
            .padding(2)
            .rotate(rotate)
            .text(labelSelector)
            .fontSize(fontSizeSelector)
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
            labelSelector,
            frequencySelector,
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
