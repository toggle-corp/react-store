import React from 'react';
import CSSModules from 'react-css-modules';
import { select } from 'd3-selection';
import { scaleOrdinal } from 'd3-scale';
import { schemeSet3 } from 'd3-scale-chromatic';
import { chord, ribbon } from 'd3-chord';
import { arc } from 'd3-shape';
import { rgb } from 'd3-color';
import { descending } from 'd3-array';
import { PropTypes } from 'prop-types';
import Responsive from '../Responsive';
import styles from './styles.scss';

const propTypes = {
    boundingClientRect: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }).isRequired,
    data: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
    labelsData: PropTypes.arrayOf(PropTypes.string).isRequired,
    margins: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
    }),
};

const defaultProps = {
    data: [],
    margins: {
        top: 50,
        right: 50,
        bottom: 100,
        left: 100,
    },
};

@Responsive
@CSSModules(styles)
export default class ChordDiagram extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    componentDidMount() {
        this.renderChart();
    }

    componentDidUpdate() {
        this.renderChart();
    }

    renderChart() {
        const {
            data,
            boundingClientRect,
            labelsData,
            margins,
        } = this.props;

        if (!boundingClientRect.width) {
            return;
        }
        let { width, height } = boundingClientRect;
        const {
            top,
            right,
            bottom,
            left,
        } = margins;

        const svg = select(this.svg);
        svg.selectAll('*').remove();

        width = width - left - right;
        height = height - top - bottom;

        const outerRadius = (Math.min(width, height) * 0.5);
        let innerRadius = outerRadius - 24;

        if (innerRadius < 0) {
            innerRadius = 0;
        }

        const chords = chord()
            .padAngle(0.05)
            .sortSubgroups(descending);

        const arcs = arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius);

        const ribbons = ribbon()
            .radius(innerRadius);

        const color = scaleOrdinal().range(schemeSet3);

        const chart = svg
            .attr('width', width + left + right)
            .attr('height', height + top + bottom)
            .append('g')
            .attr('transform', `translate(${(width + left + right) / 2}, ${(height + top + bottom) / 2})`)
            .datum(chords(data));

        function fade(opacity) {
            return function dim(g, i) {
                svg
                    .selectAll('.ribbons path')
                    .filter(d => (d.source.index !== i && d.target.index !== i))
                    .transition()
                    .style('opacity', opacity);
            };
        }

        const group = chart
            .append('g')
            .attr('class', 'groups')
            .selectAll('g')
            .data(d => d.groups)
            .enter()
            .append('g')
            .on('mouseover', fade(0.1))
            .on('mouseout', fade(1));

        const groupPath = group
            .append('path')
            .style('fill', d => color(d.index))
            .attr('id', (d, i) => `group${i}`)
            .style('stroke', d => rgb(color(d.index)).darker())
            .attr('d', arcs);

        const groupText = group
            .append('text')
            .attr('x', 6)
            .attr('dy', 15);

        groupText
            .append('textPath')
            .attr('xlink:href', (d, i) => `#group${i}`)
            .attr('pointer-events', 'none')
            .text(d => labelsData[d.index]);

        groupText
            .filter(function filtrate(d, i) {
                // eslint-disable-next-line no-underscore-dangle
                return (((groupPath._groups[0][i].getTotalLength() / 2) - 30)
                < this.getComputedTextLength());
            })
            .remove();

        chart
            .append('g')
            .attr('class', 'ribbons')
            .selectAll('path')
            .data(d => d)
            .enter()
            .append('path')
            .attr('d', ribbons)
            .style('fill', d => color(d.target.index))
            .style('stroke', d => rgb(color(d.target.index)).darker());
    }

    render() {
        return (
            <svg
                styleName="chord-diagram"
                ref={(elem) => { this.svg = elem; }}
            />
        );
    }
}
