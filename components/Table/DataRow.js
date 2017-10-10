import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';
import {
    TableHeaderPropTypes,
} from './Header';

const propTypes = {
    /**
     * required for style override
     */
    className: PropTypes.string,

    /**
     * headers is used to iterate and order columns with their key
     */
    headers: TableHeaderPropTypes.isRequired,

    /**
     * Key for column to highlight
     */
    highlightColumnKey: PropTypes.string,

    /**
     * Is cell hoverable ?
     */
    hoverableCell: PropTypes.bool.isRequired,

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
    className: '',
    highlightColumnKey: undefined,
};

/**
 * A helper component that renders a row of data in table body
 * Generally, user doesn't explicity use this component 
 */
@CSSModules(styles, { allowMultiple: true })
export default class DataRow extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getTableData = (header) => {
        const {
            rowData,
            highlightColumnKey,
            hoverableCell,
        } = this.props;

        const styleNames = [];

        if (highlightColumnKey === header.key) {
            styleNames.push('highlight');
        }

        if (hoverableCell) {
            styleNames.push('hoverable');
        }

        const styleName = styleNames.join(' ');

        return (
            <td
                key={header.key}
                onClick={() => header.onClick && header.onClick(rowData)}
                role="gridcell"
                styleName={styleName}
            >
                {
                    header.modifier
                        ? header.modifier(rowData)
                        : rowData[header.key]
                }
            </td>
        );
    }
    render() {
        const {
            headers,
        } = this.props;

        return (
            <tr className={this.props.className}>
                {
                    headers.map(header => (
                        this.getTableData(header)
                    ))
                }
            </tr>
        );
    }
}
