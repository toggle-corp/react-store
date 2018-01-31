import PropTypes from 'prop-types';
import React from 'react';

import Resizable from './Resizable';

const propTypes = {
    topChild: PropTypes.node.isRequired,
    topContainerClassName: PropTypes.string,

    bottomChild: PropTypes.node.isRequired,
    bottomContainerClassName: PropTypes.string,
};
const defaultProps = {
    topContainerClassName: '',
    bottomContainerClassName: '',
};

export default class ResizableV extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static calculateDifference = (mousePosition, lastPosition) => ( // PROPS
        mousePosition.y - lastPosition.y
    )

    static resizeContainers = (topContainer, bottomContainer, dy) => { // PROPS
        if (dy !== 0 && topContainer && bottomContainer) {
            const topContainerBoundingClient = topContainer.getBoundingClientRect();
            const topContainerHeight = topContainerBoundingClient.height + dy;

            // eslint-disable-next-line no-param-reassign
            topContainer.style.height = `${topContainerHeight}px`;
            // eslint-disable-next-line no-param-reassign
            bottomContainer.style.height = `calc(100% - ${topContainerHeight}px)`;
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
                calculateDifference={ResizableV.calculateDifference}
                resizeContainers={ResizableV.resizeContainers}
                {...otherProps}
            />
        );
    }
}
