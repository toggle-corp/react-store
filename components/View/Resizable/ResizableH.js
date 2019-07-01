import PropTypes from 'prop-types';
import React from 'react';

import Resizable from './index';

const propTypes = {
    leftChild: PropTypes.node,
    leftContainerClassName: PropTypes.string,

    rightChild: PropTypes.node,
    rightContainerClassName: PropTypes.string,
};
const defaultProps = {
    leftChild: null,
    rightChild: null,
    leftContainerClassName: '',
    rightContainerClassName: '',
};

export default class ResizableH extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    static getInitialSize = (leftContainer) => {
        if (leftContainer) {
            const leftContainerBoundingClient = leftContainer.getBoundingClientRect();
            return leftContainerBoundingClient.width;
        }
        return 0;
    }

    static calculateDifference = (mousePosition, lastPosition) => ( // PROPS
        mousePosition.x - lastPosition.x
    )

    static resizeContainers = (leftContainer, rightContainer, newWidth) => { // PROPS
        if (newWidth >= 0 && leftContainer && rightContainer) {
            // eslint-disable-next-line no-param-reassign
            leftContainer.style.width = `${newWidth}px`;
            // eslint-disable-next-line no-param-reassign
            rightContainer.style.width = `calc(100% - ${newWidth}px)`;
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
                getInitialSize={ResizableH.getInitialSize}
                calculateDifference={ResizableH.calculateDifference}
                resizeContainers={ResizableH.resizeContainers}
                {...otherProps}
            />
        );
    }
}
