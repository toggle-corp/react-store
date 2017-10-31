import React from 'react';
import CSSModules from 'react-css-modules';
import { select } from 'd3-selection';
import { cluster, hierarchy } from 'd3-hierarchy';
import { PropTypes } from 'prop-types';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

@CSSModules(styles)
export default class Dendrogram extends React.PureComponent {
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
            bottom: 100,
            left: 100,
        };

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
                    name: 'Sub A1',
                    size: 4,
                }, {
                    name: 'Sub A2',
                    size: 4,
                }],
            }],
        };

        const svg = select(this.svg);

        width = width - left - right;
        height = height - top - bottom;

        const group = svg
            .attr('width', width + left + right)
            .attr('height', height + top + bottom)
            .append('g')
            .attr('transform', `translate(${left}, ${top})`);
        const tree = cluster()
            .size([height, width - 100]);

        const root = hierarchy(data);
        tree(root);

        group
            .selectAll('.link')
            .data(root.descendants().slice(1))
            .enter()
            .append('path')
            .attr('class', 'link')
            .attr('stroke', '#268073')
            .attr('fill', 'none')
            .attr('stroke-opacity', 0.4)
            .attr('storke-width', 1.5)
            .attr('d', d =>
                `M${d.y},${d.x}C${d.parent.y + 100},${d.x}` +
                          ` ${d.parent.y + 100},${d.parent.x} ${d.parent.y},${d.parent.x}`);

        const node = group
            .selectAll('.node')
            .data(root.descendants())
            .enter()
            .append('g')
            .attr('class', d => `node ${d.children ? 'node-internal' : 'node-leaf'}`)
            .attr('transform', d => `translate(${d.y}, ${d.x})`);

        node.append('circle')
            .style('fill', '#555')
            .attr('r', 2.5);

        node.append('text')
            .attr('dy', 3)
            .attr('dx', d => (d.children ? -8 : 8))
            .style('text-anchor', d => (d.children ? 'end' : 'start'))
            .style('text-shadow', '0 1px 0 #fff, 0 -1px 0 #fff, 1px 0 0 #fff, -1px 0 0 #fff')
            .text(d => d.data.name);
    }
    render() {
        return (
            <div
                ref={(el) => { this.container = el; }}
                styleName="dendrogram-container"
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
