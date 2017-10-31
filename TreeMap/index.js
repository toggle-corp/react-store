import React from 'react';
import CSSModules from 'react-css-modules';
import { select } from 'd3-selection';
import { scaleOrdinal } from 'd3-scale';
import { schemePaired } from 'd3-scale-chromatic';
import { hierarchy, treemap } from 'd3-hierarchy';
import { format } from 'd3-format';
import { PropTypes } from 'prop-types';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

@CSSModules(styles)
export default class TreeMap extends React.PureComponent {
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

        const svg = select(this.svg);
        svg.selectAll('*').remove();

        width = width - left - right;
        height = height - top - bottom;

        const group = svg
            .attr('width', width + left + right)
            .attr('height', height + top + bottom)
            .append('g')
            .attr('transform', `translate(${left}, ${top})`);

        const color = scaleOrdinal().range(schemePaired);
        const formats = format(',d');


        const treemaps = treemap()
            .size([width, height])
            .round(true)
            .paddingInner(1);

        const data = {
            name: 'TOPICS',
            children: [{
                name: 'Topic A',
                children: [{
                    name: 'Sub A1',
                    size: 4,
                }, {
                    name: 'Sub A2',
                    size: 4,
                }],
            }, {
                name: 'Topic B',
                children: [{
                    name: 'Sub B1',
                    size: 3,
                }, {
                    name: 'Sub B2',
                    size: 3,
                }, {
                    name: 'Sub B3',
                    size: 3,
                }],
            }, {
                name: 'Topic C',
                children: [{
                    name: 'Sub C1',
                    size: 4,
                }, {
                    name: 'Sub C2',
                    size: 4,
                }],
            }],
        };

        const root = hierarchy(data)
            .sum(d => d.size);

        treemaps(root);

        const cell = group
            .selectAll('g')
            .data(root.leaves())
            .enter()
            .append('g')
            .attr('transform', d => `translate(${d.x0},${d.y0})`);

        cell.append('rect')
            .attr('id', d => d.data.name)
            .attr('width', d => d.x1 - d.x0)
            .attr('height', d => d.y1 - d.y0)
            .attr('fill', d => color(d.parent.data.name));

        cell.append('text')
            .attr('x', d => (d.x1 - d.x0) / 2)
            .attr('y', d => (d.y1 - d.y0) / 2)
            .attr('text-anchor', 'middle')
            .attr('class', 'text-label')
            .text(d => d.data.name);
        cell
            .append('title')
            .text(d => `${d.data.name}\n${formats(d.value)}`);
    }

    render() {
        return (
            <div
                ref={(el) => { this.container = el; }}
                styleName="treemap-container"
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
