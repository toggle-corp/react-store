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
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

@CSSModules(styles)
export default class ChordDiagram extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            boundingClientRect: {},
            render: false,
        };
    }

    componentDidMount() {
        window.addEventListener('resize', this.handleResize);

        setTimeout(() => {
            this.setState({
                render: true,
                boundingClientRect: this.container.getBoundingClientRect(),
            });
        }, 0);
    }

    componentDidUpdate() {
        this.renderChart();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }

    handleResize = () => {
        this.setState({
            render: true,
            boundingClientRect: this.container.getBoundingClientRect(),
        });
    }

    renderChart() {
        if (!this.state.render) {
            return;
        }
        let { width, height } = this.state.boundingClientRect;


        const {
            top,
            right,
            bottom,
            left,
        } = {
            top: 50,
            right: 50,
            bottom: 50,
            left: 50,
        };

        const matrix = [
            [2, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0],
            [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0],
            [0, 0, 0, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
            [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
            [1, 0, 0, 1, 0, 0, 4, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0],
            [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
            [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0],
            [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0],
            [0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0],
            [1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 9, 0, 0, 1, 1, 0, 1, 1, 0],
            [1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0],
            [1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 7, 1, 0, 0, 1, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
            [0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0],
            [0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
        ];

        const svg = select(this.svg);
        svg.selectAll('*').remove();

        width = width - left - right;
        height = height - top - bottom;

        const outerRadius = (Math.min(width, height) * 0.5) - 40;
        const innerRadius = outerRadius - 30;

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
            .attr('transform', `translate(${width / 2}, ${height / 2})`)
            .datum(chords(matrix));

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
            .text(d => d.index);

        groupText
            .filter(function filtrate(d, i) {
                // eslint-disable-next-line no-underscore-dangle
                return (groupPath._groups[0][i].getTotalLength() / 2) - 16
                < this.getComputedTextLength();
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
            <div
                ref={(el) => { this.container = el; }}
                styleName="chorddiagram-container"
                className={this.props.className}
            >
                <svg
                    styleName="svg"
                    ref={(elem) => { this.svg = elem; }}
                />
            </div>
        );
    }
}
