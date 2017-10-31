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
export default class RadialDendrogram extends React.PureComponent {
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
        const { width, height } = this.state.boundingClientRect;

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

        const group = svg
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${(width / 2)}, ${(height / 2)})`);

        const tree = cluster()
            .size([360, 200])
            .separation((a, b) => ((a.parent === b.parent ? 1 : 2) / a.depth));

        const root = hierarchy(data);
        tree(root);

        function project(x, y) {
            const angle = ((x - 90) / 180) * Math.PI;
            const radius = y;
            return [radius * Math.cos(angle), radius * Math.sin(angle)];
        }
        group
            .selectAll('.link')
            .data(root.descendants()
                .slice(1))
            .enter()
            .append('path')
            .attr('class', 'link')
            .attr('stroke', '#555')
            .attr('fill', 'none')
            .attr('stroke-opacity', 0.4)
            .attr('storke-width', 1.5)
            .attr('d', d =>
                `M${project(d.x, d.y)},C${project(d.x, (d.y + d.parent.y) / 2)}` +
                ` ${project(d.parent.x, (d.y + d.parent.y) / 2)} ${project(d.parent.x, d.parent.y)}`);

        const node = group
            .selectAll('.node')
            .data(root.descendants())
            .enter()
            .append('g')
            .attr('class', d => `node ${d.children ? 'node-internal' : 'node-leaf'}`)
            .attr('transform', d => `translate(${project(d.x, d.y)})`);

        node.append('circle')
            .style('fill', '#555')
            .attr('r', 2.5);

        node.append('text')
            .attr('dy', '.31em')
            .attr('x', d => ((d.x < 180) === (!d.children) ? 6 : -6))
            .style('text-anchor', d => ((d.x < 180) === !d.children ? 'start' : 'end'))
            .style('text-shadow', '0 1px 0 #fff, 0 -1px 0 #fff, 1px 0 0 #fff, -1px 0 0 #fff')
            .attr('transform', d => `rotate(${d.x < 180 ? d.x - 90 : d.x + 90})`)
            .text(d => d.data.name);
    }
    render() {
        return (
            <div
                ref={(el) => { this.container = el; }}
                styleName="radialdendrogram-container"
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
