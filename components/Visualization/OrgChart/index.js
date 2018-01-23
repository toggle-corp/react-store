import React from 'react';
import CSSModules from 'react-css-modules';
import { select } from 'd3-selection';
import { linkVertical } from 'd3-shape';
import { hierarchy, tree } from 'd3-hierarchy';
import { PropTypes } from 'prop-types';
import SvgSaver from 'svgsaver';
import Responsive from '../../General/Responsive';
import update from '../../../utils/immutable-update';
import styles from './styles.scss';
import { getStandardFilename, getColorOnBgColor, isObjectEmpty } from '../../../utils/common';

/**
 * boundingClientRect: the width and height of the container.
 * value: the selected values (nodes).
 * data: the hierarchical data to be visualized.
 * childrenAccessor: the accessor function to return array of data representing the children.
 * labelAccessor: returns the individual label from a unit data.
 * onSelection: handle selection of nodes.
 * disabled: if true no click events on nodes.
 * fillColor: default color for nodes.
 * selectColor: nodes color when selected
 * className: additional class name for styling.
 * margins: the margin object with properties for the four sides(clockwise from top).
 */
const propTypes = {
    boundingClientRect: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }).isRequired,
    value: PropTypes.array, // eslint-disable-line
    data: PropTypes.shape({
        name: PropTypes.string,
    }),
    childAccessor: PropTypes.func,
    labelAccessor: PropTypes.func,
    idAccessor: PropTypes.func,
    onSelection: PropTypes.func,
    disabled: PropTypes.bool,
    fillColor: PropTypes.string,
    selectColor: PropTypes.string,
    className: PropTypes.string,
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
    onSelection: () => [],
    disabled: false,
    fillColor: '#ffffff',
    selectColor: '#58C9B9',
    margins: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    },
};

@Responsive
@CSSModules(styles)
export default class OrgChart extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        const { value = [] } = props;
        this.state = {
            selected: value,
        };
    }

    componentDidMount() {
        this.renderChart();
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.value !== nextProps.value) {
            const { value = [] } = nextProps;
            this.setState({ selected: value });
        }
    }

    componentDidUpdate() {
        this.renderChart();
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

    findIndexInSelectedList = item => this.state.selected.findIndex(
        e => e.id === this.props.idAccessor(item),
    );

    isSelected = (item) => {
        const indexInSelection = this.findIndexInSelectedList(item);
        return indexInSelection !== -1;
    };

    renderChart = () => {
        const {
            boundingClientRect,
            data,
            childAccessor,
            labelAccessor,
            disabled,
            fillColor,
            selectColor,
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

        width = width - left - right;
        height = height - top - bottom;
        const rectSize = 30;
        const rectPadding = 20;

        const svg = select(this.svg);
        svg.selectAll('*')
            .remove();

        const group = svg
            .attr('width', width + left + right)
            .attr('height', height + top + bottom)
            .append('g')
            .attr('transform', `translate(${left}, ${top + rectPadding})`);

        const treemap = tree()
            .size([width, height - 100])
            .separation((a, b) => (a.parent === b.parent ? 1 : 1));

        const root = hierarchy(data, childAccessor);
        const treeData = treemap(root);

        const link = linkVertical()
            .x(d => d.x)
            .y(d => d.y + ((rectSize / 2) - (rectPadding)));

        group
            .selectAll('.link')
            .data(treeData.links())
            .enter()
            .append('path')
            .attr('class', 'link')
            .attr('fill', 'none')
            .attr('stroke', '#ccc')
            .attr('d', link);

        const nodes = group
            .selectAll('.node')
            .data(treeData.descendants())
            .enter()
            .append('g')
            .attr('class', d => `node ${d.children ? 'node--internal' : 'node-leaf'}`)
            .attr('transform', d => `translate(${d.x}, ${d.y + (rectSize / 2)})`);

        const colorExtractor = (item) => {
            const isSelected = this.isSelected(item.data);
            return isSelected ? selectColor : fillColor;
        };

        nodes
            .append('rect')
            .attr('rx', 6)
            .attr('ry', 6)
            .style('fill', colorExtractor)
            .style('stroke', '#666')
            .style('cursor', 'pointer')
            .style('stroke-width', '1.5px');

        nodes
            .append('text')
            .attr('dy', '.35em')
            .style('text-anchor', 'middle')
            .style('pointer-events', 'none')
            .text(d => labelAccessor(d.data))
            .style('fill', d => getColorOnBgColor(colorExtractor(d)));

        nodes
            .selectAll('rect')
            .attr('width', function wrap() {
                return this.parentNode.getBBox().width + rectPadding;
            })
            .attr('height', function wrap() {
                return this.parentNode.getBBox().height + rectPadding;
            })
            .attr('x', function position() {
                return this.parentNode.getBBox().x - (rectPadding / 2);
            })
            .attr('y', function position() {
                return this.parentNode.getBBox().y - (rectPadding / 2);
            });

        if (!disabled) {
            nodes
                .selectAll('rect')
                .on('click', (item) => {
                    this.addOrRemoveSelection(item);
                });
        }
    }

    render() {
        return (
            <div
                className={`org-chart-container ${this.props.className}`}
            >
                <svg
                    className="org-chart"
                    ref={(elem) => { this.svg = elem; }}
                />
            </div>
        );
    }
}
