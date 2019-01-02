import React from 'react';
import PropTypes from 'prop-types';

import ListView from '../../List/ListView';

import Cell from '../Cell';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    datum: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    datumKey: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]).isRequired,
    columns: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    columnKeySelector: PropTypes.func.isRequired,
    settings: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: '',
    columns: [],
    datum: {},
    settings: {},
};

export default class Row extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    cellRendererParams = (columnKey, column) => {
        const {
            datum,
            datumKey,
            settings,
        } = this.props;

        const {
            cellRendererParams,
            cellRenderer,
        } = column;

        return {
            columnKey,
            datumKey,
            column,
            datum,
            rendererParams: cellRendererParams,
            renderer: cellRenderer,
            settings,
        };
    }

    render() {
        const {
            columns,
            columnKeySelector,
            className: classNameFromProps,
        } = this.props;

        const className = `
            ${classNameFromProps}
            ${styles.rowWrapper}
        `;

        return (
            <div className={className}>
                <ListView
                    className={styles.row}
                    data={columns}
                    keySelector={columnKeySelector}
                    renderer={Cell}
                    rendererParams={this.cellRendererParams}
                />
            </div>
        );
    }
}
