import PropTypes from 'prop-types';
import React from 'react';
import { _cs } from '@togglecorp/fujs';
import memoize from 'memoize-one';

import ListView from '../List/ListView';


const propTypes = {
};

const defaultProps = {
};

export default class VirtualizedList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getRenderData = memoize((data, startIndex, endIndex) => {
        const filteredData = data.slice(startIndex, endIndex + 1);
        // console.warn(data, startIndex, endIndex);

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
