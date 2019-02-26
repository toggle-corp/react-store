import React from 'react';
import PropTypes from 'prop-types';
import { _cs } from '@togglecorp/fujs';

import FloatingContainer from '../FloatingContainer';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    tooltip: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.node,
    ]),
    children: PropTypes.node.isRequired,
};

const defaultProps = {
    className: '',
    tooltip: '',
};

const noOp = () => {};

export default class Tooltip extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.parentBCR = undefined;
        this.state = {
            showTooltip: false,
        };
    }

    handleInvalidate = (container) => {
        if (!this.parentBCR) {
            return null;
        }

        const contentRect = container.getBoundingClientRect();
        const windowRect = {
            width: window.innerWidth,
            height: window.innerHeight,
        };
        let topCalc = this.parentBCR.top - 12 - contentRect.height;
        let leftCalc = this.parentBCR.left - (contentRect.width / 2);

        const leftBoundMax = this.parentBCR.left + (contentRect.width / 2);

        if (topCalc < 0) {
            topCalc = this.parentBCR.bottom + 12;
        }
        if (leftCalc < 0) {
            leftCalc = 0;
        } else if (leftBoundMax > windowRect.width) {
            leftCalc = windowRect.width - contentRect.width;
        }

        const optionsContainerPosition = {
            top: `${topCalc}px`,
            left: `${leftCalc}px`,
            width: 'auto',
        };

        return optionsContainerPosition;
    }

    handleHover = (e) => {
        this.parentBCR = { left: e.clientX, top: e.clientY };
        this.setState({ showTooltip: true });
    }

    handleHoverOut = () => {
        this.parentBCR = undefined;
        this.setState({ showTooltip: false });
    }

    render() {
        const {
            tooltip,
            children: child,
            className,
        } = this.props;

        const { showTooltip } = this.state;

        const props = {
            onMouseOver: this.handleHover,
            onMouseOut: this.handleHoverOut,
            onFocus: noOp,
            onBlur: noOp,
        };
        const isTooltipNode = typeof tooltip === 'object';

        return (
            <React.Fragment>
                {React.cloneElement(child, props)}
                {showTooltip &&
                    <FloatingContainer
                        className={_cs(
                            styles.container,
                            !isTooltipNode && styles.textTooltip,
                            className,
                        )}
                        onInvalidate={this.handleInvalidate}
                        focusTrap
                    >
                        {tooltip}
                    </FloatingContainer>
                }
            </React.Fragment>
        );
    }
}
