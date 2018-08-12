import React from 'react';
import PropTypes from 'prop-types';

import ListView from '../List/ListView';

import Row from './Row';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    rowClassName: PropTypes.string,

    headerRendererParams: PropTypes.func,
    headerRenderer: PropTypes.func.isRequired,

    data: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    columns: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    keySelector: PropTypes.func,
};

const defaultProps = {
    className: '',
    rowClassName: '',

    headerRendererParams: () => {},

    data: [],
    columns: [],
    keySelector: datum => datum.key,
};

export default class Taebul extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static columnKeySelector = column => column.key;

    headerRendererParams = (columnKey, column) => {
        const { headerRendererParams } = this.props;
        return headerRendererParams({
            column,
            columnKey,
        });
    }

    rowRendererParams = (datumKey, datum) => {
        const { columns } = this.props;
        return {
            columnKeySelector: Taebul.columnKeySelector,
            columns,
            datum,
            datumKey,
        };
    }

    render() {
        const {
            data,
            columns,
            headerRenderer,
            keySelector,
            className: classNameFromProps,
            rowClassName: rowClassNameFromProps,
        } = this.props;

        const className = `${styles.taebul} ${classNameFromProps}`;
        const rowClassName = `${styles.row} ${rowClassNameFromProps}`;

        return (
            <div className={className}>
                <ListView
                    className={styles.head}
                    data={columns}
                    keyExtractor={Taebul.columnKeySelector}
                    renderer={headerRenderer}
                    rendererParams={this.headerRendererParams}
                />
                <ListView
                    className={styles.body}
                    data={data}
                    keyExtractor={keySelector}
                    renderer={Row}
                    rendererParams={this.rowRendererParams}
                    rendererClassName={rowClassName}
                />
            </div>
        );
    }
}
