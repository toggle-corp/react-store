import React from 'react';
import PropTypes from 'prop-types';

import FloatingContainer from '../FloatingContainer';
import styles from './styles.scss';

const noOp = () => {};

export default class ComponentWithTooltip extends React.PureComponent {
    constructor(props) {
        super(props);
        this.parentBCR = undefined;
        this.state = {
            showTooltip: false,
        };
    }

    handleInvalidate = (container) => {
        // Note: pass through prop
        // eslint-disable-next-line react/prop-types
        const { parentBCR } = this;
        if (!parentBCR) {
            return null;
        }

        const contentRect = container.getBoundingClientRect();
        const windowRect = {
            width: window.innerWidth,
            height: window.innerHeight,
        };
        let topCalc = parentBCR.top - 12 - contentRect.height;
        let leftCalc = parentBCR.left - (contentRect.width / 2);

        const leftBoundMax = parentBCR.left + (contentRect.width / 2);

        if (topCalc < 0) {
            topCalc = parentBCR.bottom + 12;
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
            title,
            children: child,
        } = this.props;

        const { showTooltip } = this.state;

        const props = {
            onMouseOver: this.handleHover,
            onMouseOut: this.handleHoverOut,
            onFocus: noOp,
            onBlur: noOp,
        };

        return (
            <React.Fragment>
                {React.cloneElement(child, props)}
                {showTooltip &&
                    <FloatingContainer
                        className={styles.container}
                        onInvalidate={this.handleInvalidate}
                        focusTrap
                    >
                        {title}
                    </FloatingContainer>
                }
            </React.Fragment>
        );
    }
}
