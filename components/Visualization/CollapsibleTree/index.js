import React from 'react';
import CSSModules from 'react-css-modules';
import { select } from 'd3-selection';
import { hierarchy, tree } from 'd3-hierarchy';
import { scaleOrdinal } from 'd3-scale';
import { easeSinInOut } from 'd3-ease';
import { schemePaired } from 'd3-scale-chromatic';
import { PropTypes } from 'prop-types';
import SvgSaver from 'svgsaver';
import Responsive from '../../General/Responsive';
import styles from './styles.scss';
import { getStandardFilename, isObjectEmpty } from '../../../utils/common';
import LoadingAnimation from '../../View/LoadingAnimation';

/**
 * boundingClientRect: the width and height of the container.
 * data: the hierarchical data to be visualized.
 * childrenAccessor: the accessor function to return array of data representing the children.
 * labelAccessor: returns the individual label from a unit data.
 * colorScheme: the color scheme for links that connect the nodes.
 * className: additional class name for styling.
 * margins: the margin object with properties for the four sides(clockwise from top).
 */
const propTypes = {
    boundingClientRect: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }).isRequired,
    data: PropTypes.shape({
        name: PropTypes.string,
    }),
    childrenAccessor: PropTypes.func,
    labelAccessor: PropTypes.func.isRequired,
    colorScheme: PropTypes.arrayOf(PropTypes.string),
    className: PropTypes.string,
    margins: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
    }),
    loading: PropTypes.bool,
};

const defaultProps = {
    data: [],
    childrenAccessor: d => d.children,
    colorScheme: schemePaired,
    className: '',
    margins: {
        top: 50,
        right: 50,
        bottom: 100,
        left: 100,
    },
    loading: false,
};

/**
 * CollapsibleTree is a tree diagram showing the hierarchical structure of the data.
 */
@Responsive
@CSSModules(styles)
export default class CollapsibleTree extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    componentDidMount() {
        this.renderChart();
    }
    componentDidUpdate() {
        this.renderChart();
    }

    save = () => {
        const svg = select(this.svg);
        const svgsaver = new SvgSaver();
        svgsaver.asSvg(svg.node(), `${getStandardFilename('collapsible-tree', 'graph')}.svg`);
    }

    renderChart = () => {
        const {
            data,
            childrenAccessor,
            boundingClientRect,
            labelAccessor,
            colorScheme,
            margins,
        } = this.props;

        if (!boundingClientRect.width) {
            return;
        }

        if (!data || data.length === 0 || isObjectEmpty(data)) {
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

        const colors = scaleOrdinal()
            .range(colorScheme);

        function topicColors(node) {
            let color = colors(0);
            if (node.depth === 0 || node.depth === 1) {
                color = colors(labelAccessor(node.data));
            } else {
                color = topicColors(node.parent);
            }
            return color;
        }

        function diagonal(s, d) {
            const path = `M ${s.y} ${s.x}
            C ${(s.y + d.y) / 2} ${s.x},
              ${(s.y + d.y) / 2} ${d.x},
              ${d.y} ${d.x}`;

            return path;
        }

        const group = svg
            .attr('width', width + left + right)
            .attr('height', height + top + bottom)
            .append('g')
            .attr('transform', `translate(${left},${top})`);

        const trees = tree()
            .size([height, width - 160]);

        const root = hierarchy(data, childrenAccessor);
        root.x0 = height / 2;
        root.y0 = 0;

        let i = 0;
        let transitionTime = 0;
        function update(source) {
            const treeData = trees(root);
            const nodes = treeData.descendants();
            const links = treeData.descendants().slice(1);

            const node = group
                .selectAll('g.node')
                .data(nodes, (d) => {
                    if (d.id) {
                        return d.id;
                    }
                    d.id = ++i; //eslint-disable-line
                    return d.id;
                });

            function click(d) {
                if (d.children) {
                    d.childrens = d.children; // eslint-disable-line
                    d.children = null; // eslint-disable-line
                } else {
                    d.children = d.childrens; // eslint-disable-line
                    d.childrens = null; // eslint-disable-line
                }
                transitionTime = 500;
                update(d);
            }

            const nodeEnter = node
                .enter()
                .append('g')
                .attr('class', 'node')
                .attr('transform', `translate(${source.y0}, ${source.x0})`)
                .on('click', click);

            nodeEnter
                .append('circle')
                .attr('class', 'node')
                .attr('r', 0)
                .style('fill', topicColors);

            nodeEnter
                .append('text')
                .attr('dy', '.35em')
                .attr('fill-opacity', 0)
                .attr('x', d => (d.children || d.childrens ? -13 : 13))
                .attr('text-anchor', d => ((d.children || d.childrens) ? 'end' : 'start'))
                .text(d => labelAccessor(d.data));

            const nodeUpdate = nodeEnter.merge(node);

            nodeUpdate
                .transition()
                .ease(easeSinInOut)
                .duration(transitionTime)
                .attr('transform', d => `translate(${d.y}, ${d.x})`);

            nodeUpdate
                .select('circle.node')
                .attr('r', 10)
                .style('fill', topicColors)
                .style('stroke', d => (d.childrens ? '#039be5' : '#fff'))
                .attr('cursor', 'pointer');

            nodeUpdate
                .selectAll('text')
                .transition()
                .ease(easeSinInOut)
                .style('fill-opacity', 1);

            const nodeExit = node
                .exit()
                .transition()
                .ease(easeSinInOut)
                .duration(transitionTime)
                .attr('transform', `translate(${source.y}, ${source.x})`)
                .remove();

            nodeExit
                .select('circle')
                .attr('r', 0);

            nodeExit
                .select('text')
                .style('fill-opacity', 0);

            const link = group
                .selectAll('path.link')
                .data(links, d => d.id);

            const linkEnter = link
                .enter()
                .insert('path', 'g')
                .attr('class', 'link')
                .attr('stroke', topicColors)
                .attr('fill', 'none')
                .attr('d', () => {
                    const out = { x: source.x0, y: source.y0 };
                    return diagonal(out, out);
                });

            const linkUpdate = linkEnter
                .merge(link);

            linkUpdate
                .transition()
                .ease(easeSinInOut)
                .duration(transitionTime)
                .attr('d', d => diagonal(d, d.parent));

            link
                .exit()
                .transition()
                .ease(easeSinInOut)
                .duration(transitionTime)
                .attr('d', () => {
                    const out = { x: source.x, y: source.y };
                    return diagonal(out, out);
                })
                .remove();

            nodes.forEach((d) => {
                d.x0  = d.x; // eslint-disable-line
                d.y0 = d.y; // eslint-disable-line
            });
        }
        update(root);
    }

    render() {
        const { loading } = this.props;

        return (
            <div
                className={`collapsible-tree-container ${this.props.className}`}
            >
                { loading && <LoadingAnimation /> }
                <svg
                    className="collapsible-tree"
                    ref={(elem) => { this.svg = elem; }}
                />
            </div>
        );
    }
}
