import PropTypes from 'prop-types';
import React from 'react';

import Resizable from './Resizable';

const propTypes = {
    leftChild: PropTypes.node.isRequired,
    leftContainerClassName: PropTypes.string,

    rightChild: PropTypes.node.isRequired,
    rightContainerClassName: PropTypes.string,
};
const defaultProps = {
    leftContainerClassName: '',
    rightContainerClassName: '',
};

export default class ResizableH extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static calculateDifference = (mousePosition, lastPosition) => ( // PROPS
        mousePosition.x - lastPosition.x
    )

    static resizeContainers = (leftContainer, rightContainer, dx) => { // PROPS
        if (dx !== 0 && leftContainer && rightContainer) {
            const leftContainerBoundingClient = leftContainer.getBoundingClientRect();
            const leftContainerWidth = leftContainerBoundingClient.width + dx;

            // eslint-disable-next-line no-param-reassign
            leftContainer.style.width = `${leftContainerWidth}px`;
            // eslint-disable-next-line no-param-reassign
            rightContainer.style.width = `calc(100% - ${leftContainerWidth}px)`;
        }
    }

    render() {
        const {
            leftChild,
            leftContainerClassName,
            rightChild,
            rightContainerClassName,
            ...otherProps
        } = this.props;
        return (
            <Resizable
                firstChild={leftChild}
                firstContainerClassName={leftContainerClassName}
                secondChild={rightChild}
                secondContainerClassName={rightContainerClassName}
                resizableClassName="resizable-h"
                calculateDifference={ResizableH.calculateDifference}
                resizeContainers={ResizableH.resizeContainers}
                {...otherProps}
            />
        );
    }
}
