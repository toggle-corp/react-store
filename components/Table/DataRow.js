import PropTypes from 'prop-types';
import React from 'react';

import {
    randomString,
} from '../../utils/common';

import {
    TableHeaderPropTypes,
} from './Header';

const propTypes = {
    /**
     * headers is used to iterate and order columns with their key
     */
    headers: TableHeaderPropTypes.isRequired,

    /**
     * keyExtractor is used to get a unique key associated with rowData
     */
    keyExtractor: PropTypes.func,

    /**
     * rowData is used to fill out columns in data row.
     * it is basically an object with keys similar to that of header
     */
    rowData: PropTypes.shape({
        key: PropTypes.string,
        // NOTE: the shape of rowData is dynamic
    }).isRequired,
};

const defaultProps = {
    keyExtractor: () => randomString(),
};

/**
 * A helper component that renders a row of data in table body
 * Generally, user doesn't explicity use this component 
 */
export default class DataRow extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            headers,
            keyExtractor,
            rowData,
        } = this.props;

        return (
            <tr key={keyExtractor(rowData)}>
                {
                    headers.map(header => (
                        <td
                            role="gridcell"
                            key={header.key}
                            onClick={() => header.onClick && header.onClick(rowData)}
                        >
                            {
                                header.modifier
                                    ? header.modifier(rowData)
                                    : rowData[header.key]
                            }
                        </td>
                    ))
                }
            </tr>
        );
    }
}
