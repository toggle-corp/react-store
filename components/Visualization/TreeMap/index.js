import React from 'react';
import { select } from 'd3-selection';
import { PropTypes } from 'prop-types';
import {
    scaleOrdinal,
} from 'd3-scale';
import { schemeSet3 } from 'd3-scale-chromatic';
import {
    hierarchy,
    treemap,
} from 'd3-hierarchy';
import SvgSaver from 'svgsaver';
import { getColorOnBgColor, doesObjectHaveNoData } from '@togglecorp/fujs';

import Responsive from '../../General/Responsive';
import { getStandardFilename } from '../../../utils/common';

import styles from './styles.scss';

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
    valueSelector: PropTypes.func.isRequired,
    labelSelector: PropTypes.func.isRequired,
    colorScheme: PropTypes.arrayOf(PropTypes.string),
    className: PropTypes.string,
};

const defaultProps = {
    data: {},
    setSaveFunction: () => {},
    childrenSelector: d => d.children,
    colorScheme: schemeSet3,
    className: '',
};

class TreeMap extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        if (props.setSaveFunction) {
            props.setSaveFunction(this.save);
        }
    }

    componentDidMount() {
        this.drawChart();
    }

    componentDidUpdate() {
        this.redrawChart();
    }

    save = () => {
        const svg = select(this.svg);
        const svgsaver = new SvgSaver();
        svgsaver.asSvg(svg.node(), `${getStandardFilename('treemap', 'graph')}.svg`);
    }

    redrawChart = () => {
        const svg = select(this.svg);
        svg.selectAll('*').remove();
        this.drawChart();
    }

    handleMouseOver = (element) => {
        select(element)
            .transition()
            .attr('opacity', 1);
    }

    handleMouseOut = (element) => {
        select(element)
            .transition()
            .attr('opacity', 0.8);
    }

    drawChart = () => {
        const {
            data,
            childrenSelector,
            boundingClientRect,
            valueSelector,
            labelSelector,
            colorScheme,
        } = this.props;

        if (!boundingClientRect.width || !data || doesObjectHaveNoData(data)) {
            return;
        }

        const { width, height } = boundingClientRect;

        const group = select(this.svg)
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .datum(data);

        const treemaps = treemap()
            .size([width, height])
            .round(true)
            .padding(d => d.height);

        const colors = scaleOrdinal()
            .range(colorScheme);

        const root = hierarchy(data, childrenSelector)
            .sum(d => valueSelector(d));
        treemaps(root);

        const cell = group
            .selectAll('g')
            .data(root.leaves())
            .enter()
            .append('g')
            .attr('transform', d => `translate(${d.x0}, ${d.y0})`);

        cell
            .append('rect')
            .attr('class', styles.rectangle)
            .attr('id', d => valueSelector(d.data))
            .attr('width', d => d.x1 - d.x0)
            .attr('height', d => d.y1 - d.y0)
            .attr('fill', d => colors(labelSelector(d.parent.data)))
            .attr('opacity', 0.8)
            .on('mouseover', (d, i, nodes) => this.handleMouseOver(nodes[i]))
            .on('mouseout', (d, i, nodes) => this.handleMouseOut(nodes[i]));

        cell
            .append('text')
            .attr('x', d => (d.x1 - d.x0) / 2)
            .attr('y', d => (d.y1 - d.y0) / 2)
            .attr('text-anchor', 'middle')
            .attr('class', styles.label)
            .text(d => labelSelector(d.data))
            .style('fill', d => getColorOnBgColor(colors(labelSelector(d.parent.data))))
            .style('visibility', (d, i, nodes) => {
                const textLength = nodes[i].getComputedTextLength();
                const elementWidth = (d.x1 - d.x0);
                return textLength < elementWidth ? 'visible' : 'hidden';
            });

        cell
            .append('title')
            .text(d => `${labelSelector(d.data)}`);
    }

    render() {
        const { className } = this.props;

        const treemapStyle = [
            'treemap',
            styles.treemap,
            className,
        ].join(' ');

        return (
            <svg
                className={treemapStyle}
                ref={(elem) => { this.svg = elem; }}
            />
        );
    }
}

export default Responsive(TreeMap);
