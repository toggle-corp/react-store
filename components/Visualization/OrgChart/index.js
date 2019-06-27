import React from 'react';
import { select, event } from 'd3-selection';
import { linkVertical } from 'd3-shape';
import { hierarchy, tree } from 'd3-hierarchy';
import { zoom } from 'd3-zoom';
import { PropTypes } from 'prop-types';
import SvgSaver from 'svgsaver';
import { doesObjectHaveNoData } from '@togglecorp/fujs';

import Icon from '../../General/Icon';
import Responsive from '../../General/Responsive';
import update from '../../../utils/immutable-update';
import { getStandardFilename } from '../../../utils/common';

import styles from './styles.scss';

const propTypes = {
    /**
     * Width and height of the container
     */
    boundingClientRect: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }).isRequired,
    /**
     * Function to pass save function to parent component
     */
    setSaveFunction: PropTypes.func,
    /**
     * Selected values (nodes)
     */
    value: PropTypes.array, // eslint-disable-line
    /**
     * Hierarchical data to be visualized
     */
    data: PropTypes.shape({
        name: PropTypes.string,
    }),
    /**
     * Accessor function to return array of data representing the children
     */
    childSelector: PropTypes.func,
    /**
     * Access the individual label of each data element
     */
    labelSelector: PropTypes.func,
    /**
     * Access the id of each data element
     */
    idSelector: PropTypes.func,
    /**
     * Handle selection of nodes
     */
    onSelection: PropTypes.func,
    /**
     * If true no click events on nodes
     */
    /**
     * Cluster minimum layout's node size
     */
    nodeSize: PropTypes.shape({
        minNodeWidth: PropTypes.number,
        minNodeHeight: PropTypes.number,
    }),
    /**
     * Additional class name for styling
     */
    className: PropTypes.string,
    /**
     *  Margin object with properties for the four sides(clockwise from top)
     */
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
    setSaveFunction: () => {},
    childSelector: d => d.children,
    labelSelector: d => d.name,
    idSelector: d => d.id,
    nodeSize: {
        minNodeWidth: 150,
        minNodeHeight: 50,
    },
    onSelection: () => [],
    disabled: false,
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
class OrgChart extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        if (props.setSaveFunction) {
            props.setSaveFunction(this.save);
        }
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
        const { value } = this.props;
        if (value !== nextProps.value) {
            const { value: newValue = [] } = nextProps;
            this.setState({ selected: newValue });
        }
    }

    componentDidUpdate() {
        this.redrawChart();
    }

    getNodeClassName = (d) => {
        const classNames = [
            'node',
            styles.node,
        ];

        if (d.children) {
            classNames.push('node-internal');
        } else {
            classNames.push('node-leaf');
        }

        const isActive = this.isSelected(d.data);
        if (isActive) {
            classNames.push(styles.active);
            classNames.push('active');
        }

        return classNames.join(' ');
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
        const newSelection = this.props.idSelector(item.data);

        const settings = {
            $bulk: [
                { $push: [newSelection] },
                { $unique: selection => selection },
            ],
        };
        this.setState((prevState) => {
            const selected = update(prevState.selected, settings);
            return { selected };
        });

        this.props.onSelection(this.state.selected);
    }

    removeSelection = (item) => {
        const index = this.findIndexInSelectedList(item.data);

        const settings = {
            $splice: [[index, 1]],
        };
        this.setState((prevState) => {
            const selected = update(prevState.selected, settings);
            return { selected };
        });
        this.props.onSelection(this.state.selected);
    }

    findIndexInSelectedList = (item) => {
        const itemId = this.props.idSelector(item);
        return this.state.selected.findIndex(e => e === itemId);
    }


    isSelected = (item) => {
        const indexInSelection = this.findIndexInSelectedList(item);
        return indexInSelection !== -1;
    };

    drawChart = () => {
        const {
            boundingClientRect,
            data,
            childSelector,
            labelSelector,
            disabled,
            nodeSize,
            margins,
        } = this.props;

        const svg = select(this.svg);
        if (!boundingClientRect.width) {
            return;
        }

        if (!data || data.length === 0 || doesObjectHaveNoData(data)) {
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
            .attr(
                'transform',
                `translate(
                    ${this.x + left + (width / 2)},
                    ${top + rectWidth + this.y}) scale(${this.k}
                )`,
            );

        const root = hierarchy(data, childSelector);

        const widthPerTreeLeaves = width / root.leaves().length;
        const heightPerTreeDepth = height / root.height;
        const { minNodeWidth, minNodeHeight } = nodeSize;
        const nodeWidth = widthPerTreeLeaves < minNodeWidth
            ? minNodeWidth : widthPerTreeLeaves;
        const nodeHeight = heightPerTreeDepth < minNodeHeight
            ? minNodeHeight : heightPerTreeDepth - rectWidth;

        const treemap = tree()
            .nodeSize([nodeWidth, nodeHeight])
            .separation((a, b) => (a.parent === b.parent ? 1 : 1.25));
        const treeData = treemap(root);
        const link = linkVertical()
            .x(d => d.x)
            .y(d => d.y);

        const linkClassName = `${styles.link} link`;
        group
            .selectAll('.link')
            .data(treeData.links())
            .enter()
            .append('path')
            .attr('class', linkClassName)
            .attr('d', link);

        const nodes = group
            .selectAll('.node')
            .data(treeData.descendants())
            .enter()
            .append('g')
            .attr('class', this.getNodeClassName)
            .attr('transform', d => `translate(${d.x}, ${d.y})`);

        nodes
            .append('rect')
            .style('cursor', 'pointer');

        nodes
            .append('text')
            .attr('dy', '.35em')
            .style('text-anchor', 'middle')
            .style('pointer-events', 'none')
            .text(d => labelSelector(d.data));

        const boxPadding = {
            x: 10,
            y: 6,
        };
        const getBBox = d => select(d).node().parentNode.getBBox();
        nodes
            .selectAll('rect')
            .attr('width', (d, i, groups) => getBBox(groups[i]).width + (boxPadding.x * 2))
            .attr('height', (d, i, groups) => getBBox(groups[i]).height + (boxPadding.y * 2))
            .attr('x', (d, i, groups) => getBBox(groups[i]).x - boxPadding.x)
            .attr('y', (d, i, groups) => getBBox(groups[i]).y - boxPadding.y);

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
            // for internal styling
            styles.orgChart,

            // global class name, for external override
            'org-chart',

            className,
        ].join(' ');

        const chartClassName = [
            styles.chart,
            'chart',
        ].join(' ');

        const infoIconClassName = [
            styles.infoIcon,
            'info-icon',
        ].join(' ');

        return (
            <div className={containerClassName}>
                <Icon
                    className={infoIconClassName}
                    name="info"
                    title="Use mouse to pan and zoom"
                />
                <svg
                    className={chartClassName}
                    ref={(elem) => { this.svg = elem; }}
                />
            </div>
        );
    }
}

export default Responsive(OrgChart);
