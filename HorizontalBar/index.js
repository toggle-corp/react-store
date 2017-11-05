import React from 'react';
import CSSModules from 'react-css-modules';
import { select } from 'd3-selection';
import { scaleLinear, scaleBand } from 'd3-scale';
import { axisLeft, axisBottom } from 'd3-axis';
import { max } from 'd3-array';
import { PropTypes } from 'prop-types';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

@CSSModules(styles)
export default class HorizontalBar extends React.PureComponent {
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
        window.removeEventListener('resize', this.handleResize());
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

        const data = [
            { label: 'Category 1', value: 19 },
            { label: 'Category 2', value: 5 },
            { label: 'Category 3', value: 13 },
            { label: 'Category 4', value: 17 },
            { label: 'Category 5', value: 19 },
            { label: 'Category 6', value: 27 },
        ];

        const {
            top,
            right,
            bottom,
            left,
        } = {
            top: 50,
            right: 50,
            bottom: 50,
            left: 100,
        };

        let { width, height } = this.state.boundingClientRect;

        width = width - left - right;
        height = height - top - bottom;

        if (width < 0) width = 0;
        if (height < 0) height = 0;

        const svg = select(this.svg);
        svg.select('*').remove();

        const group = svg
            .attr('width', width + left + right)
            .attr('height', height + top + bottom)
            .append('g')
            .attr('transform', `translate(${left}, ${top})`);

        const x = scaleLinear()
            .range([0, width])
            .domain([0, max(data, d => d.value)]);

        const y = scaleBand()
            .rangeRound([height, 0])
            .domain(data.map(d => d.label))
            .padding(0.2);

        const xAxis = axisBottom(x);
        const yAxis = axisLeft(y);

        group
            .append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0, ${height})`)
            .call(xAxis);

        group
            .append('g')
            .attr('class', 'y-axis')
            .call(yAxis);

        group
            .selectAll('.bar')
            .data(data)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', 0)
            .attr('y', d => y(d.label))
            .attr('height', y.bandwidth())
            .attr('width', d => x(d.value));
    }

    render() {
        return (
            <div
                className={this.props.className}
                styleName="horizontal-bar-container"
                ref={(el) => { this.container = el; }}
            >
                <svg
                    className="svg"
                    ref={(elem) => { this.svg = elem; }}
                />
            </div>
        );
    }
}
