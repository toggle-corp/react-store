import React from 'react';
import PropTypes from 'prop-types';

import ListView from '../../List/ListView';
import VirtualizedList from '../../VirtualizedList';

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
            containerScrollLeft,
            startIndex,
            endIndex,
            startVirtualContainerWidth,
            endVirtualContainerWidth,
            itemHeight,
        } = this.props;

        const className = `
            ${classNameFromProps}
            ${styles.rowWrapper}
        `;

        return (
            <div
                className={className}
                style={{
                    height: `${itemHeight}px`,
                }}
            >
                <div className={styles.row}>
                    <VirtualizedList
                        data={columns}
                        className={styles.visibleSection}
                        keySelector={columnKeySelector}
                        renderer={Cell}
                        rendererParams={this.cellRendererParams}
                        startIndex={startIndex}
                        endIndex={endIndex}
                        startVirtualContainerClassName={styles.startVirtualContainer}
                        startVirtualContainerWidth={startVirtualContainerWidth}
                        endVirtualContainerClassName={styles.endVirtualContainer}
                        endVirtualContainerWidth={endVirtualContainerWidth}
                    />
                </div>
            </div>
        );
    }
}
