import React from 'react';
import { select, event } from 'd3-selection';
import { linkVertical } from 'd3-shape';
import { hierarchy, tree } from 'd3-hierarchy';
import { zoom } from 'd3-zoom';
import { PropTypes } from 'prop-types';
import SvgSaver from 'svgsaver';
import Responsive from '../../General/Responsive';
import BoundError from '../../General/BoundError';
import update from '../../../utils/immutable-update';
import {
    getStandardFilename,
    getColorOnBgColor,
    isObjectEmpty,
} from '../../../utils/common';
import iconNames from '../../../constants/iconNames';

import styles from './styles.scss';

const propTypes = {
    /* the width and height of the container */
    boundingClientRect: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }).isRequired,
    /* the selected values (nodes) */
    value: PropTypes.array, // eslint-disable-line
    /* the hierarchical data to be visualized */
    data: PropTypes.shape({
        name: PropTypes.string,
    }),
    /* the accessor function to return array of data representing the children */
    childAccessor: PropTypes.func,
    /* access the individual label of each data element */
    labelAccessor: PropTypes.func,
    /* access the id of each data element */
    idAccessor: PropTypes.func,
    /* handle selection of nodes */
    onSelection: PropTypes.func,
    /* if true no click events on nodes */
    disabled: PropTypes.bool,
    /* default color for nodes */
    fillColor: PropTypes.string,
    /* nodes color when selected */
    selectColor: PropTypes.string,
    /* the cluster minimum layout's node size */
    nodeSize: PropTypes.shape({
        minNodeWidth: PropTypes.number,
        minNodeHeight: PropTypes.number,
    }),
    /* additional class name for styling */
    className: PropTypes.string,
    /* the margin object with properties for the four sides(clockwise from top) */
    margins: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
    }),
};

const defaultProps = {
    className: '',
    value: [],
    data: {},
    childAccessor: d => d.children,
    labelAccessor: d => d.name,
    idAccessor: d => d.id,
    nodeSize: {
        minNodeWidth: 150,
        minNodeHeight: 150,
    },
    onSelection: () => [],
    disabled: false,
    fillColor: '#ffffff',
    selectColor: '#afeeee',
    margins: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    },
};

const rectWidth = 30;
@BoundError()
@Responsive
export default class OrgChart extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        Object.assign(this, { x: 0, y: 0, k: 1 });
        const { value = [] } = props;
        this.state = {
            selected: value,
        };
    }

    componentDidMount() {
        this.drawChart();
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.value !== nextProps.value) {
            const { value = [] } = nextProps;
            this.setState({ selected: value });
        }
    }

    componentDidUpdate() {
        this.redrawChart();
    }

    save = () => {
        const svg = select(this.svg);
        const svgsaver = new SvgSaver();
        svgsaver.asSvg(svg.node(), `${getStandardFilename('orgchart', 'graph')}.svg`);
    }

    addOrRemoveSelection = (item) => {
        const isSelected = this.isSelected(item.data);
        if (isSelected) {
            this.removeSelection(item);
        } else {
            this.addSelection(item);
        }
    };

    addSelection = (item) => {
        const newSelection = {
            name: this.props.labelAccessor(item.data),
            id: this.props.idAccessor(item.data),
        };

        const settings = {
            $bulk: [
                { $push: [newSelection] },
                { $unique: selection => selection.id },
            ],
        };
        const selected = update(this.state.selected, settings);

        this.setState({ selected });
        this.props.onSelection(selected);
    }

    removeSelection = (item) => {
        const index = this.findIndexInSelectedList(item.data);

        const settings = {
            $splice: [[index, 1]],
        };
        const selected = update(this.state.selected, settings);

        this.setState({ selected });
        this.props.onSelection(selected);
    }

    findIndexInSelectedList = item =>
        this.state.selected.findIndex(e => e.id === this.props.idAccessor(item));


    isSelected = (item) => {
        const indexInSelection = this.findIndexInSelectedList(item);
        return indexInSelection !== -1;
    };


    drawChart = () => {
        const {
            boundingClientRect,
            data,
            childAccessor,
            labelAccessor,
            disabled,
            fillColor,
            nodeSize,
            selectColor,
            margins,
        } = this.props;

        const svg = select(this.svg);
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

        width = width - left - right;
        height = height - top - bottom;

        const group = svg
            .attr('width', width + left + right)
            .attr('height', height + top + bottom)
            .call(zoom().on('zoom', () => {
                const { x, y, k } = event.transform;
                Object.assign(this, { x, y, k });
                group
                    .attr('transform', `translate(${x + left + (width / 2)}, ${top + rectWidth + y}) scale(${k})`);
            }))
            .append('g')
            .attr('transform',
                `translate(${this.x + left + (width / 2)}, ${top + rectWidth + this.y}) scale(${this.k})`);

        const root = hierarchy(data, childAccessor);

        const widthPerTreeLeaves = width / root.leaves().length;
        const heightPerTreeDepth = height / root.height;
        const { minNodeWidth, minNodeHeight } = nodeSize;
        const nodeWidth = widthPerTreeLeaves < minNodeWidth ?
            minNodeWidth : widthPerTreeLeaves;
        const nodeHeight = heightPerTreeDepth < minNodeHeight ?
            minNodeHeight : heightPerTreeDepth - rectWidth;

        const treemap = tree()
            .nodeSize([nodeWidth, nodeHeight])
            .separation((a, b) => (a.parent === b.parent ? 1 : 1.25));
        const treeData = treemap(root);
        const link = linkVertical()
            .x(d => d.x)
            .y(d => d.y);

        const colorExtractor = (item) => {
            const isSelected = this.isSelected(item.data);
            return isSelected ? selectColor : fillColor;
        };

        group
            .selectAll('.link')
            .data(treeData.links())
            .enter()
            .append('path')
            .attr('class', 'link')
            .style('fill', 'none')
            .style('stroke', '#ccc')
            .attr('d', link);

        const nodes = group
            .selectAll('.node')
            .data(treeData.descendants())
            .enter()
            .append('g')
            .attr('class', d => `node ${d.children ? 'node--internal' : 'node-leaf'}`)
            .attr('transform', d => `translate(${d.x}, ${d.y})`);

        nodes
            .append('rect')
            .attr('rx', 3)
            .attr('ry', 3)
            .style('fill', colorExtractor)
            .style('stroke', '#bdbdbd')
            .style('cursor', 'pointer');

        nodes
            .append('text')
            .attr('dy', '.35em')
            .style('text-anchor', 'middle')
            .style('pointer-events', 'none')
            .text(d => labelAccessor(d.data))
            .style('fill', d => getColorOnBgColor(colorExtractor(d)));

        const boxPadding = 15;

        nodes
            .selectAll('rect')
            .attr('width', (d, i, groups) => select(groups[i]).node().parentNode.getBBox().width + boxPadding)
            .attr('height', (d, i, groups) => select(groups[i]).node().parentNode.getBBox().height + boxPadding)
            .attr('x', (d, i, groups) => select(groups[i]).node().parentNode.getBBox().x - (boxPadding / 2))
            .attr('y', (d, i, groups) => select(groups[i]).node().parentNode.getBBox().y - (boxPadding / 2));

        if (!disabled) {
            nodes
                .selectAll('rect')
                .on('click', (item) => {
                    this.addOrRemoveSelection(item);
                });
        }
    }

    redrawChart = () => {
        const svg = select(this.svg);
        svg.selectAll('*').remove();
        this.drawChart();
    }

    render() {
        const { className } = this.props;
        const containerClassName = [
            styles.container,
            className,
        ].join(' ');
        return (
            <div
                className={containerClassName}
            >
                <svg
                    className={styles.orgChart}
                    ref={(elem) => { this.svg = elem; }}
                />
                <span
                    className={`${styles.info} ${iconNames.info}`}
                    title="Use mouse to pan and zoom"
                />
            </div>
        );
    }
}
