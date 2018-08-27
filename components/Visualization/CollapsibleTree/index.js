import React, {
    Fragment,
} from 'react';
import {
    select,
    event,
} from 'd3-selection';
import {
    hierarchy,
    tree,
} from 'd3-hierarchy';
import { scaleOrdinal } from 'd3-scale';
import { easeSinInOut } from 'd3-ease';
import { schemePaired } from 'd3-scale-chromatic';
import { zoom } from 'd3-zoom';
import { PropTypes } from 'prop-types';
import SvgSaver from 'svgsaver';
import Responsive from '../../General/Responsive';
import {
    getStandardFilename,
    isObjectEmpty,
} from '../../../utils/common';
import iconNames from '../../../constants/iconNames';

import styles from './styles.scss';

/**
 * boundingClientRect: the width and height of the container.
 * data: the hierarchical data to be visualized.
 * childrenSelector: the accessor function to return array of data representing the children.
 * labelSelector: returns the individual label from a unit data.
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
    setSaveFunction: PropTypes.func,
    childrenSelector: PropTypes.func,
    labelSelector: PropTypes.func.isRequired,
    colorScheme: PropTypes.arrayOf(PropTypes.string),
    nodeSize: PropTypes.arrayOf(PropTypes.number),
    className: PropTypes.string,
    margins: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
    }),
};

const defaultProps = {
    data: [],
    setSaveFunction: () => {},
    childrenSelector: d => d.children,
    colorScheme: schemePaired,
    nodeSize: [50, 300],
    className: '',
    margins: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    },
};

/**
 * CollapsibleTree is a tree diagram showing the hierarchical structure of the data.
 */

class CollapsibleTree extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        if (props.setSaveFunction) {
            props.setSaveFunction(this.save);
        }
        Object.assign(this, { x: 0, y: 0, k: 1 });
    }

    componentDidMount() {
        this.drawChart();
    }
    componentDidUpdate() {
        this.redrawChart();
    }

    setContext = (width, height, margins) => {
        const {
            top,
            right,
            bottom,
            left,
        } = margins;

        const group = select(this.svg)
            .attr('width', width + left + right)
            .attr('height', height + top + bottom)
            .call(
                zoom()
                    .filter(() => event.ctrlKey)
                    .on('zoom', () => {
                        const { x, y, k } = event.transform;
                        Object.assign(this, { x, y, k });
                        group
                            .attr('transform', `translate(${x + left}, ${y + top + (height / 2)}) scale(${k})`);
                    }))
            .append('g')
            .attr('transform', `translate(${left},${top + (height / 2)})`);

        return group;
    }

    setupChart = () => {
        const {
            data,
            childrenSelector,
            boundingClientRect,
            colorScheme,
            nodeSize,
            margins,
        } = this.props;

        const { width, height } = boundingClientRect;
        const {
            top,
            right,
            bottom,
            left,
        } = margins;

        this.width = width - left - right;
        this.height = height - top - bottom;

        this.trees = tree().nodeSize(nodeSize);
        this.root = hierarchy(data, childrenSelector);
        this.root.x0 = height / 2;
        this.root.y0 = 0;
        this.colors = scaleOrdinal().range(colorScheme);
        this.group = this.setContext(this.width, this.height, margins);
        this.duration = 0;
    }

    save = () => {
        const svg = select(this.svg);
        const svgsaver = new SvgSaver();
        svgsaver.asSvg(svg.node(), `${getStandardFilename('collapsible-tree', 'graph')}.svg`);
    }

    topicColors = (node) => {
        const { labelSelector } = this.props;
        let color = this.colors(0);
        if (node.depth === 0 || node.depth === 1) {
            color = this.colors(labelSelector(node.data));
        } else {
            color = this.topicColors(node.parent);
        }
        return color;
    }

    diagonal = (s, d) => {
        const path = `M ${s.y} ${s.x}
            C ${(s.y + d.y) / 2} ${s.x},
              ${(s.y + d.y) / 2} ${d.x},
              ${d.y} ${d.x}`;

        return path;
    }

    click = (d) => {
        if (d.children) {
            d.childrens = d.children; // eslint-disable-line no-param-reassign
            d.children = null; // eslint-disable-line no-param-reassign
        } else {
            d.children = d.childrens; // eslint-disable-line no-param-reassign
            d.childrens = null; // eslint-disable-line no-param-reassign
        }
        this.duration = 500;
        this.update(d);
    }

    addNodes = (group, source, nodes) => {
        const { labelSelector } = this.props;

        let i = 0;
        const node = group
            .selectAll('g.node')
            .data(nodes, (d) => {
                if (d.id) {
                    return d.id;
                }
                i += 1;
                d.id = i; // eslint-disable-line no-param-reassign
                return d.id;
            });
        const nodeEnter = node
            .enter()
            .append('g')
            .attr('class', 'node')
            .attr('cursor', 'pointer')
            .attr('transform', `translate(${source.y0}, ${source.x0})`)
            .on('click', this.click);

        nodeEnter
            .append('circle')
            .attr('class', 'node')
            .attr('r', 0)
            .style('stroke', '#fff')
            .style('stroke-width', '2px')
            .style('fill', this.topicColors);

        nodeEnter
            .append('text')
            .attr('dy', '.35em')
            .attr('fill-opacity', 0)
            .attr('x', 0)
            .attr('y', -12) // d => (d.children || d.childrens ? 16 : 0))
            .attr('text-anchor', 'middle') // d => (d.children ? 'end' : 'start'))
            .text(d => labelSelector(d.data));


        group
            .select('text')
            .call((d) => {
                const { margins } = this.props;
                const {
                    top,
                    left,
                } = margins;
                const {
                    x = 0,
                    y = 0,
                    k = 1,
                } = this;
                const rootTextLength = d.node().getComputedTextLength() || 1;
                const translateX = x < rootTextLength ? rootTextLength : 0;
                group
                    .transition()
                    .attr('transform', `translate(${x + left + translateX}, ${y + top + (this.height / 2)}) scale(${k})`);
            });

        const nodeUpdate = nodeEnter.merge(node);

        nodeUpdate
            .transition()
            .ease(easeSinInOut)
            .duration(this.duration)
            .attr('transform', d => `translate(${d.y}, ${d.x})`);

        nodeUpdate
            .select('circle.node')
            .attr('r', 6)
            .style('fill', this.topicColors)
            .style('stroke', d => (d.childrens ? '#039be5' : '#fff'));

        nodeUpdate
            .selectAll('text')
            .transition()
            .ease(easeSinInOut)
            .style('fill-opacity', 1);

        const nodeExit = node
            .exit()
            .transition()
            .ease(easeSinInOut)
            .duration(this.duration)
            .attr('transform', `translate(${source.y}, ${source.x})`)
            .remove();

        nodeExit
            .select('circle')
            .attr('r', 0);

        nodeExit
            .select('text')
            .style('fill-opacity', 0);
    }

    addLinks = (group, source, links) => {
        const link = group
            .selectAll('path.link')
            .data(links, d => d.id);

        const linkEnter = link
            .enter()
            .insert('path', 'g')
            .attr('class', 'link')
            .attr('stroke', this.topicColors)
            .attr('stroke-width', '1px')
            .attr('fill', 'none')
            .attr('d', () => {
                const out = { x: source.x0, y: source.y0 };
                return this.diagonal(out, out);
            });

        const linkUpdate = linkEnter
            .merge(link);

        linkUpdate
            .transition()
            .ease(easeSinInOut)
            .duration(this.duration)
            .attr('d', d => this.diagonal(d, d.parent));

        link
            .exit()
            .transition()
            .ease(easeSinInOut)
            .duration(this.duration)
            .attr('d', () => {
                const out = { x: source.x, y: source.y };
                return this.diagonal(out, out);
            })
            .remove();
    }

    update = (source) => {
        const treeData = this.trees(this.root);
        const nodes = treeData.descendants();
        const links = treeData.descendants().slice(1);

        this.addNodes(this.group, source, nodes);
        this.addLinks(this.group, source, links);
        nodes.forEach((d) => {
            d.x0 = d.x; // eslint-disable-line no-param-reassign
            d.y0 = d.y; // eslint-disable-line no-param-reassign
        });
    }

    drawChart = () => {
        const {
            data,
            boundingClientRect,
        } = this.props;

        if (!boundingClientRect.width) {
            return;
        }

        if (boundingClientRect.width === 0 ||
            boundingClientRect.height === 0) {
            return;
        }

        if (!data || data.length === 0 || isObjectEmpty(data)) {
            return;
        }

        this.setupChart();
        this.update(this.root);
    }

    redrawChart = () => {
        const svg = select(this.svg);
        svg.selectAll('*').remove();
        this.drawChart();
    }

    render() {
        const { className } = this.props;
        const treeStyle = [
            'collapsible-tree',
            styles.collapsibleTree,
            className,
        ].join(' ');

        return (
            <Fragment>
                <svg
                    className={treeStyle}
                    ref={(elem) => { this.svg = elem; }}
                />
                <span
                    className={`${styles.info} ${iconNames.info}`}
                    title="Use Ctrl + mouse to pan and zoom"
                />
            </Fragment>
        );
    }
}

export default Responsive(CollapsibleTree);
