import React from 'react';
import PropTypes from 'prop-types';

import ListView from '../List/ListView';

import Header from './Header';
import Row from './Row';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    rowClassName: PropTypes.string,

    data: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    columns: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    keySelector: PropTypes.func.isRequired,
    settings: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: '',
    rowClassName: '',
    data: [],
    columns: [],
    settings: {},
};

export default class Taebul extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static columnKeySelector = column => column.key;

    headerRendererParams = (columnKey, column) => {
        const { data, settings } = this.props;
        const {
            headerRenderer,
            headerRendererParams,
        } = column;

        return {
            columnKey,
            column,
            data,
            renderer: headerRenderer,
            rendererParams: headerRendererParams,
            settings,
        };
    }

    rowRendererParams = (datumKey, datum) => {
        const { columns, settings } = this.props;
        return {
            datum,
            datumKey,
            columnKeySelector: Taebul.columnKeySelector,
            columns,
            settings,
        };
    }

    render() {
        const {
            data,
            columns,
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
                    keySelector={Taebul.columnKeySelector}
                    renderer={Header}
                    rendererParams={this.headerRendererParams}
                />
                <ListView
                    className={styles.body}
                    data={data}
                    keySelector={keySelector}
                    renderer={Row}
                    rendererParams={this.rowRendererParams}
                    rendererClassName={rowClassName}
                />
            </div>
        );
    }
}
