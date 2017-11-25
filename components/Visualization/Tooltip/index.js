import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import { select, event } from 'd3-selection';

import styles from './styles.scss';

const propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.node,
    ]),
    className: PropTypes.string,
};

const defaultProps = {
    children: undefined,
    className: '',
};


/**
 * Component showing tooltip
 * TODO:
 * 1. avoid tooltip from going outside page
 * 2. provide window for tooltip.
 * 3. orientation: left, right, top, bottom
 */
@CSSModules(styles, { allowMultiple: true })
export default class Tooltip extends React.PureComponent {
    static defaultProps = defaultProps;
    static propTypes = propTypes;

    getd3Tooltip = () => {
        if (!this.d3Tooltip) {
            this.d3Tooltip = select(this.divContainer);
            // TODO: fix mouseout trigger and remove this
            this.d3Tooltip
                .on('mouseenter', this.hide);
        }
        return this.d3Tooltip;
    }

    show = () => {
        // show tooltip
        this.getd3Tooltip().style('display', 'inline-block');
    }

    hide = () => {
        // hide tooltip
        this.getd3Tooltip().style('display', 'none');
    }

    move = () => {
        // move the tooltip to mouse position
        const node = this.getd3Tooltip().node();

        if (node) {
            const tipShape = node.getBoundingClientRect();
            this.getd3Tooltip().style('left', `${event.pageX - (tipShape.width * 0.5)}px`)
                .style('top', `${event.pageY - tipShape.height - 10}px`);
        }
    }

    render() {
        const { children, className } = this.props;

        if (!children) {
            return <div />;
        }

        return (
            <div
                className={className}
                styleName="tooltip"
                ref={(div) => { this.divContainer = div; }}
            >
                {children}
            </div>
        );
    }
}
