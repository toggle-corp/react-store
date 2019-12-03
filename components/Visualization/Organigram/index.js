import React, {
    PureComponent,
    Fragment,
} from 'react';
import { select, event } from 'd3-selection';
import { linkVertical } from 'd3-shape';
import { hierarchy, tree } from 'd3-hierarchy';
import { zoom } from 'd3-zoom';
import { PropTypes } from 'prop-types';
import { getColorOnBgColor, doesObjectHaveNoData } from '@togglecorp/fujs';

import Icon from '../../General/Icon';
import Responsive from '../../General/Responsive';

import styles from './styles.scss';

const propTypes = {
    /**
     * Hierarchical data structure that can be computed to form a hierarchical layout
     * <a href="https://github.com/d3/d3-hierarchy">d3-hierarchy</a>
     */
    data: PropTypes.shape({
        name: PropTypes.string,
    }),
    /**
     * Size of the parent element/component (passed by the Responsive hoc)
     */
    boundingClientRect: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }).isRequired,
    /**
     * Selected data element
     */
    value: PropTypes.string,
    /**
     * Accessor function to return array of data representing the children
     */
    childrenSelector: PropTypes.func,
    /**
     * Access the individual label of each data element
     */
    labelSelector: PropTypes.func.isRequired,
    /**
     * Access the id of each data element
     */
    idSelector: PropTypes.func.isRequired,
    /**
     * Handle selection of nodes
     */
    onSelection: PropTypes.func,
    /**
     * Cluster layout's node size
     * <a href="https://github.com/d3/d3-hierarchy#cluster_nodeSize">nodeSize</a>
     */
    nodeSize: PropTypes.arrayOf(PropTypes.number),
    /**
     * if true no click events on nodes
     */
    disabled: PropTypes.bool,
    /**
     *  Default color for nodes
     */
    fillColor: PropTypes.string,
    /**
     * Nodes color when selected
     */
    selectColor: PropTypes.string,
    /**
     * Additional class name for styling
     */
    className: PropTypes.string,
    /**
     *  Margin object with properties for the four sides (clockwise from top)
     */
    margins: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
    }),
};

const defaultProps = {
    data: [],
    value: undefined,
    childrenSelector: d => d.children,
    onSelection: () => {},
    nodeSize: [150, 300],
    disabled: false,
    fillColor: '#ffffff',
    selectColor: '#afeeee',
    className: '',
    margins: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    },
};

const rectWidth = 30;

/**
 * Organigram shows the structure and relationships of nodes as a hierarchy.
 */
class Organigram extends PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        Object.assign(this, { x: 0, y: 0, k: 1 });
    }

    state = {
        selected: this.props.value,
    };

    componentDidMount() {
        this.drawChart();
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        const { value } = this.props;
        if (value !== nextProps.value) {
            this.setState({
                selected: nextProps.value,
            });
        }
    }

    componentDidUpdate() {
        this.redrawChart();
    }

    setContext = (width, height, margins) => {
        const {
            top,
            left,
        } = margins;

        const group = select(this.svg)
            .call(zoom().on('zoom', () => {
                const { x, y, k } = event.transform;
                Object.assign(this, { x, y, k });
                group
                    .attr('transform', `translate(${x + left + (width / 2)}, ${top + rectWidth + y}) scale(${k})`);
            }))
            .append('g')
            .attr('transform',
                `translate(${this.x + left + (width / 2)}, ${top + rectWidth + this.y}) scale(${this.k})`);

        return group;
    }

    addDropShadow = (svg) => {
        const defs = svg.append('defs');

        const filter = defs
            .append('filter')
            .attr('id', 'drop-shadow')
            .attr('height', '130%');

        filter
            .append('feGaussianBlur')
            .attr('in', 'SourceAlpha')
            .attr('stdDeviation', 2)
            .attr('result', 'blur');

        filter
            .append('feOffset')
            .attr('in', 'blur')
            .attr('dx', 3)
            .attr('dy', 3)
            .attr('result', 'offsetBlur');

        filter
            .append('feFlood')
            .attr('flood-color', '#e0e0e0')
            .attr('flood-opacity', 1)
            .attr('result', 'offsetColor');

        filter
            .append('feComposite')
            .attr('in', 'offsetColor')
            .attr('in2', 'offsetBlur')
            .attr('operator', 'in')
            .attr('result', 'offsetBlur');

        const feMerge = filter.append('feMerge');

        feMerge
            .append('feMergeNode')
            .attr('in', 'offsetBlur');
        feMerge
            .append('feMergeNode')
            .attr('in', 'SourceGraphic');
    }

    toggleSelection = (data) => {
        const isSelected = this.isSelected(data);
        if (isSelected) {
            this.removeSelection();
        } else {
            this.addSelection(data);
        }
    }

    addSelection = (data) => {
        const { idSelector } = this.props;

        const newSelection = idSelector(data);
        this.setState({
            selected: newSelection,
        });

        this.props.onSelection(newSelection);
    }

    removeSelection = () => {
        this.setState({
            selected: undefined,
        }, () => {
            this.props.onSelection(undefined);
        });
    }

    isSelected = data => this.props.idSelector(data) === this.state.selected;

    colorExtractor = (item) => {
        const {
            selectColor,
            fillColor,
        } = this.props;

        const isSelected = this.isSelected(item.data);
        return isSelected ? selectColor : fillColor;
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
            childrenSelector,
            labelSelector,
            nodeSize,
            disabled,
            margins,
        } = this.props;

        let {
            width,
            height,
        } = boundingClientRect;

        const {
            top,
            right,
            bottom,
            left,
        } = margins;

        width = width - left - right;
        height = height - top - bottom;

        const {
            setContext,
            colorExtractor,
            addDropShadow,
            toggleSelection,
        } = this;

        if (!boundingClientRect.width || doesObjectHaveNoData(data)) {
            return;
        }

        addDropShadow(select(this.svg));
        const group = setContext(width, height, margins);
        const treemap = tree()
            .nodeSize(nodeSize)
            .separation((a, b) => (a.parent === b.parent ? 1 : 1.5));

        const root = hierarchy(data, childrenSelector);
        const treeData = treemap(root);
        const links = treeData.links();
        const points = treeData.descendants();
        const link = linkVertical()
            .x(d => d.x)
            .y(d => d.y);

        group
            .selectAll('.link')
            .data(links)
            .enter()
            .append('path')
            .attr('class', 'link')
            .attr('fill', 'none')
            .attr('stroke', '#ccc')
            .attr('d', link);

        const node = group
            .selectAll('.node')
            .data(points)
            .enter()
            .append('g')
            .attr('class', d => `node ${d.children ? 'node--internal' : 'node-leaf'}`)
            .attr('transform', d => `translate(${d.x}, ${d.y})`);

        node
            .append('rect')
            .attr('class', 'box')
            .attr('rx', 3)
            .attr('ry', 3)
            .style('fill', colorExtractor)
            .style('stroke', '#bdbdbd')
            .style('filter', 'url(#drop-shadow)')
            .style('cursor', 'pointer');

        node
            .append('text')
            .attr('dy', '.35em')
            .style('text-anchor', 'middle')
            .style('pointer-events', 'none')
            .text(d => labelSelector(d.data))
            .style('fill', d => getColorOnBgColor(colorExtractor(d)));

        const boxPadding = 10;

        node
            .selectAll('.box')
            .attr('width', (d, i, nodes) => select(nodes[i]).node().parentNode.getBBox().width + boxPadding)
            .attr('height', (d, i, nodes) => select(nodes[i]).node().parentNode.getBBox().height + boxPadding)
            .attr('x', (d, i, nodes) => select(nodes[i]).node().parentNode.getBBox().x - (boxPadding / 2))
            .attr('y', (d, i, nodes) => select(nodes[i]).node().parentNode.getBBox().y - (boxPadding / 2));

        if (!disabled) {
            node
                .selectAll('.box')
                .on('click', (cell) => {
                    toggleSelection(cell.data);
                });
        }
    }

    render() {
        const {
            className,
            boundingClientRect: {
                width,
                height,
            },
        } = this.props;

        const svgClassName = [
            'organigram',
            styles.organigram,
            className,
        ].join(' ');

        return (
            <Fragment>
                <svg
                    ref={(elem) => { this.svg = elem; }}
                    className={svgClassName}
                    style={{
                        width,
                        height,
                    }}
                />
                <Icon
                    className={styles.info}
                    name="info"
                    title="Use mouse to pan and zoom"
                />
            </Fragment>
        );
    }
}

export default Responsive(Organigram);
