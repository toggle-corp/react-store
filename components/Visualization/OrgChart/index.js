import React from 'react';
import CSSModules from 'react-css-modules';
import { select } from 'd3-selection';
import { linkVertical } from 'd3-shape';
import { hierarchy, tree } from 'd3-hierarchy';
import { PropTypes } from 'prop-types';
import Responsive from '../../General/Responsive';
import styles from './styles.scss';
import { getColorOnBgColor, unique } from '../../../utils/common';

const propTypes = {
    boundingClientRect: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }).isRequired,
    data: PropTypes.shape({
        name: PropTypes.string,
    }).isRequired,
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
        this.selected = [];
    }

    componentDidMount() {
        this.renderChart();
    }

    componentDidUpdate() {
        this.renderChart();
    }

    addSelection = (item) => {
        this.selected = [
            ...this.selected,
            {
                name: this.props.labelAccessor(item.data),
                id: this.props.idAccessor(item.data),
            },
        ];
        this.props.onSelection(unique(this.selected, this.props.idAccessor));
    }

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

        nodes
            .append('rect')
            .attr('rx', 6)
            .attr('ry', 6)
            .style('fill', fillColor)
            .style('stroke', '#666')
            .style('cursor', 'pointer')
            .style('stroke-width', '1.5px');

        nodes
            .append('text')
            .attr('dy', '.35em')
            .style('text-anchor', 'middle')
            .style('pointer-events', 'none')
            .text(d => labelAccessor(d.data))
            .style('fill', getColorOnBgColor(fillColor));

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
            const that = this;
            nodes
                .selectAll('rect')
                .on('click', function handleClick(item) {
                    const element = select(this);
                    element.classed('selected', !element.classed('selected'));
                    const isSelected = element.classed('selected');
                    console.log(isSelected);
                    element.style('fill', isSelected ? selectColor : fillColor);
                    if (isSelected) {
                        that.addSelection(item);
                    }
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
