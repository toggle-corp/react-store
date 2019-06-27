import PropTypes from 'prop-types';
import React from 'react';

import { select, event } from 'd3-selection';

import styles from './styles.scss';

const propTypes = {
    /**
     * Initial Children elements
     */
    initialChildren: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.node,
    ]),
    /**
     * Additional css classes passed from parent
     */
    className: PropTypes.string,
    /**
     * Api to provide options to the component
     */
    setTooltipApi: PropTypes.func,
};

const defaultProps = {
    initialChildren: undefined,
    className: '',
    setTooltipApi: undefined,
};


/**
 * Tooltip component to show tooltips in charts.
 */
export default class Tooltip extends React.PureComponent {
    static defaultProps = defaultProps;

    static propTypes = propTypes;

    constructor(props) {
        super(props);

        this.state = {
            children: props.initialChildren,
        };

        if (props.setTooltipApi) {
            props.setTooltipApi({
                show: this.show,
                setTooltip: this.setTooltip,
                hide: this.hide,
                move: this.move,
            });
        }
    }

    componentWillUnmount() {
        const { setTooltipApi } = this.props;
        if (setTooltipApi) {
            setTooltipApi(undefined);
        }
    }

    getd3Tooltip = () => select(this.divContainer)

    setTooltip = (children) => {
        // set the tooltip content
        this.setState({
            children,
        });
    }

    show = () => {
        // show tooltip
        this.getd3Tooltip()
            .style('opacity', 1);
    }

    hide = () => {
        // hide tooltip
        this.getd3Tooltip()
            .style('opacity', 0);
    }

    move = ({ x, y, orentation, padding = 10, duration = 0 } = {}) => {
        // move the tooltip to mouse position
        const node = this.getd3Tooltip().node();

        if (node) {
            const tipShape = node.getBoundingClientRect();
            let xOffset;
            let yOffset;

            switch (orentation) {
                case 'left':
                    xOffset = -(tipShape.width + padding);
                    yOffset = -(tipShape.height * 0.5);
                    break;
                case 'right':
                    xOffset = padding;
                    yOffset = -(tipShape.height * 0.5);
                    break;
                case 'bottom':
                    xOffset = -(tipShape.width * 0.5);
                    yOffset = padding;
                    break;
                default: // default is top
                    xOffset = -(tipShape.width * 0.5);
                    yOffset = -(tipShape.height + padding);
            }

            this.getd3Tooltip()
                .transition()
                .duration(duration)
                .style('left', `${(x || event.pageX) + (xOffset)}px`)
                .style('top', `${(y || event.pageY) + yOffset}px`);
        }
    }

    render() {
        const { className } = this.props;
        const { children } = this.state;
        const hide = !children ? 'hide' : '';
        return (
            <div
                className={`${className} ${styles.tooltip} ${styles[hide]}`}
                ref={(div) => { this.divContainer = div; }}
            >
                {children}
            </div>
        );
    }
}
