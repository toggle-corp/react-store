import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

/**
 * key: unique key for each column, the key is also used to determine
 *      the data for rows in the body
 *
 * label: text label for the column
 *
 * order: the order in which they appear relative to that of other header columns
 *
 * sortable: is element sortable?
 *
 * comparator: comparator function for sorting, recieves data rows(not column data)
 *
 * modifier: returns a renderable object for the column, recieves whole row of data (not column)
 */
export const TableHeaderPropTypes = PropTypes.arrayOf(
    PropTypes.shape({
        key: PropTypes.string,
        label: PropTypes.string,
        data: PropTypes.string,
        order: PropTypes.number,
        sortable: PropTypes.bool,
        comparator: PropTypes.func,
        modifier: PropTypes.func,
    }),
);

/**
 * activeKey: key of the column by which the rows are currently sorted
 * 
 * sortOrder: current sort order (ASC/DSC)
 * 
 */
export const TableHeaderMetaPropTypes = PropTypes.shape({
    activeKey: PropTypes.string.isRequired,
    sortOrder: PropTypes.string.isRequired,
});

const propTypes = {
    /**
     * headers is an array of the structure objects required for the header
     */
    headers: TableHeaderPropTypes.isRequired,

    /**
     * headersMeta is internal info of table header 
     */
    headerMeta: TableHeaderMetaPropTypes,

    /**
     * A callback function which is called when a header is clicked
     * header key is sent to the function as parameter
     */
    onClick: PropTypes.func.isRequired,
};

const defaultProps = {
    headerMeta: undefined,
};

@CSSModules(styles, { allowMultiple: true })
export default class Header extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const { headers, headerMeta, onClick } = this.props;

        // FIXME: why not make a static function?
        const activeHeaderStyleName = headerMeta ? `active ${headerMeta.sortOrder}` : '';

        // FIXME: why not make a static function?
        const getStyleName = header => (
            header.sortable
                ? `sortable ${
                    headerMeta.activeKey === header.key
                        ? activeHeaderStyleName
                        : ''
                }`
                : ''
        );

        // FIXME: dont' use inline functions (in onClick)

        return (
            <thead>
                <tr>
                    {
                        headers.map(header => (
                            <th
                                key={header.key}
                                onClick={() => { onClick(header.key); }}
                                styleName={getStyleName(header)}
                            >
                                {header.label}
                            </th>
                        ))
                    }
                </tr>
            </thead>
        );
    }
}
