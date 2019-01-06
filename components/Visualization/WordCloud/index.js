import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cloud from 'd3-cloud';
import SvgSaver from 'svgsaver';
import { select } from 'd3-selection';
import { scaleOrdinal } from 'd3-scale';
import { schemeSet1 } from 'd3-scale-chromatic';

import Responsive from '../../General/Responsive';
import { getStandardFilename } from '../../../utils/common';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    boundingClientRect: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }).isRequired,
    data: PropTypes.arrayOf(
        PropTypes.shape({
            text: PropTypes.string,
            size: PropTypes.number,
        }),
    ).isRequired,
    padding: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
    font: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    rotate: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
    setSaveFunction: PropTypes.func,
    fontSizeSelector: PropTypes.func,
    onWordMouseOver: PropTypes.func,
    onWordClick: PropTypes.func,
    colorScheme: PropTypes.arrayOf(PropTypes.string),
};

const defaultProps = {
    className: '',
    font: 'serif',
    padding: 5,
    rotate: 0,
    setSaveFunction: undefined,
    onWordClick: undefined,
    onWordMouseOver: undefined,
    fontSizeSelector: d => d.size,
    colorScheme: schemeSet1,
};

class WordCloud extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        if (props.setSaveFunction) {
            props.setSaveFunction(this.save);
        }
    }

    componentDidMount() {
        this.drawChart();
    }

    componentDidUpdate() {
        this.redrawChart();
    }

    save = () => {
        const svgsaver = new SvgSaver();
        const svg = select(this.svg);
        svgsaver.asSvg(svg.node(), `${getStandardFilename('wordcloud', 'graph')}.svg`);
    }

    redrawChart = () => {
        const svg = select(this.svg);
        svg.selectAll('*').remove();
        this.drawChart();
    }

    drawChart = () => {
        const {
            data,
            boundingClientRect,
            font,
            padding,
            rotate,
            fontSizeSelector,
            onWordClick,
            onWordMouseOver,
            colorScheme,
        } = this.props;

        if (!boundingClientRect.width || !data || data.length === 0) {
            return;
        }

        const {
            width,
            height,
        } = boundingClientRect;

        const colors = scaleOrdinal().range(colorScheme);

        const layout = cloud()
            .size([width, height])
            .font(font)
            .words(data)
            .padding(padding)
            .rotate(rotate)
            .fontSize(fontSizeSelector)
            .on('end', (words) => {
                const group = select(this.svg)
                    .append('g')
                    .attr('transform', `translate(${layout.size()[0] / 2}, ${layout.size()[1] / 2})`);


                const texts = group
                    .selectAll('text')
                    .data(words)
                    .enter()
                    .append('text')
                    .style('font-size', d => `${d.size}px`)
                    .style('font-family', font)
                    .style('fill', (d, i) => colors(i))
                    .attr('text-anchor', 'middle')
                    .attr('transform', d => `translate(${d.x}, ${d.y}) rotate(${d.rotate})`)
                    .text(d => d.text);

                if (onWordClick) {
                    texts.on('click', onWordClick);
                }

                if (onWordMouseOver) {
                    texts.on('mouseover', onWordMouseOver);
                }
            });

        layout.start();
    }

    render() {
        const { className: classNameFromProps } = this.props;

        const className = [
            'word-cloud',
            styles.wordCloud,
            classNameFromProps,
        ].join(' ');

        return (
            <svg
                className={className}
                ref={(elem) => { this.svg = elem; }}
            />
        );
    }
}

export default Responsive(WordCloud);
