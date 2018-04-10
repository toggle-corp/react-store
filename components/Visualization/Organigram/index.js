import React from 'react';
import { select } from 'd3-selection';
import { linkVertical } from 'd3-shape';
import { hierarchy, tree } from 'd3-hierarchy';
import { PropTypes } from 'prop-types';

import Responsive from '../../General/Responsive';
import BoundError from '../../General/BoundError';

import {
    getColorOnBgColor,
    isObjectEmpty,
} from '../../../utils/common';

import styles from './styles.scss';

const propTypes = {
    data: PropTypes.shape({
        name: PropTypes.string,
    }),
    boundingClientRect: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }).isRequired,
    value: PropTypes.string,
    childrenAccessor: PropTypes.func,
    labelAccessor: PropTypes.func.isRequired,
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
    data: [],
    value: undefined,
    childrenAccessor: d => d.children,
    labelAccessor: d => d.name,
    idAccessor: d => d.id,
    onSelection: () => {},
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

@BoundError()
@Responsive
export default class Organigram extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    state = {
        selected: this.props.value,
    };

    componentDidMount() {
        this.drawChart();
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.value !== nextProps.value) {
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
            right,
            bottom,
            left,
        } = margins;

        return select(this.svg)
            .attr('width', width + left + right)
            .attr('height', height + top + bottom)
            .append('g')
            .attr('transform', `translate(${left}, ${top + 30})`);
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
        const { idAccessor } = this.props;

        const newSelection = idAccessor(data);
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

    isSelected = data => this.props.idAccessor(data) === this.state.selected;

    calculateBounds = () => {
        const {
            margins,
            boundingClientRect,
        } = this.props;

        const {
            width,
            height,
        } = boundingClientRect;

        const {
            top,
            right,
            bottom,
            left,
        } = margins;

        this.width = width - left - right;
        this.height = height - top - bottom;
    }

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
            childrenAccessor,
            labelAccessor,
            disabled,
            margins,
        } = this.props;

        this.calculateBounds();

        const {
            setContext,
            width,
            height,
            colorExtractor,
            addDropShadow,
            toggleSelection,
        } = this;

        if (!boundingClientRect.width || isObjectEmpty(data)) {
            return;
        }

        addDropShadow(select(this.svg));
        const group = setContext(width, height, margins);
        const treemap = tree()
            .size([width, height - 50]);
        const root = hierarchy(data, childrenAccessor);
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
            .text(d => labelAccessor(d.data))
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
        const { className } = this.props;

        const svgClassName = [
            styles.organigram,
            className,
        ].join(' ');

        return (
            <svg
                ref={(elem) => { this.svg = elem; }}
                className={svgClassName}
            />
        );
    }
}
