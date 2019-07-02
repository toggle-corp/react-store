import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';

import ListView from '../List/ListView';


const propTypes = {
    startIndex: PropTypes.number.isRequired,
    endIndex: PropTypes.number.isRequired,
    endVirtualContainerWidth: PropTypes.number.isRequired,
    startVirtualContainerWidth: PropTypes.number.isRequired,
    startVirtualContainerClassName: PropTypes.string,
    endVirtualContainerClassName: PropTypes.string,
    data: PropTypes.array, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    startVirtualContainerClassName: undefined,
    endVirtualContainerClassName: undefined,
    data: [],
};

export default class VirtualizedList extends React.Component {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    getRenderData = memoize((data, startIndex, endIndex) => {
        const filteredData = data.slice(startIndex, endIndex + 1);
        return filteredData;
    })

    render() {
        const {
            startVirtualContainerWidth,
            startVirtualContainerClassName,
            startIndex,
            endIndex,
            endVirtualContainerWidth,
            endVirtualContainerClassName,
            data,
            ...otherProps
        } = this.props;

        const renderData = this.getRenderData(data, startIndex, endIndex);

        return (
            <React.Fragment>
                <div
                    className={startVirtualContainerClassName}
                    style={{ width: startVirtualContainerWidth }}
                />
                <ListView
                    data={renderData}
                    {...otherProps}
                />
                <div
                    className={endVirtualContainerClassName}
                    style={{ width: endVirtualContainerWidth }}
                />
            </React.Fragment>
        );
    }
}
