import PropTypes from 'prop-types';
import React from 'react';

import Resizable from './index';

const propTypes = {
    topChild: PropTypes.node,
    topContainerClassName: PropTypes.string,

    bottomChild: PropTypes.node,
    bottomContainerClassName: PropTypes.string,
};
const defaultProps = {
    topChild: null,
    bottomChild: null,
    topContainerClassName: '',
    bottomContainerClassName: '',
};

export default class ResizableV extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    static getInitialSize = (topContainer) => {
        if (topContainer) {
            const topContainerBoundingClient = topContainer.getBoundingClientRect();
            return topContainerBoundingClient.height;
        }
        return 0;
    }

    static calculateDifference = (mousePosition, lastPosition) => ( // PROPS
        mousePosition.y - lastPosition.y
    )

    static resizeContainers = (topContainer, bottomContainer, newHeight) => { // PROPS
        if (newHeight >= 0 && topContainer && bottomContainer) {
            // eslint-disable-next-line no-param-reassign
            topContainer.style.height = `${newHeight}px`;
            // eslint-disable-next-line no-param-reassign
            bottomContainer.style.height = `calc(100% - ${newHeight}px)`;
        }
    }

    render() {
        const {
            topChild,
            topContainerClassName,
            bottomChild,
            bottomContainerClassName,
            ...otherProps
        } = this.props;
        return (
            <Resizable
                firstChild={topChild}
                firstContainerClassName={topContainerClassName}
                secondChild={bottomChild}
                secondContainerClassName={bottomContainerClassName}
                resizableClassName="resizable-v"
                getInitialSize={ResizableV.getInitialSize}
                calculateDifference={ResizableV.calculateDifference}
                resizeContainers={ResizableV.resizeContainers}
                {...otherProps}
            />
        );
    }
}
