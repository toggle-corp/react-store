import * as React from 'react';

export interface Header<Data> {
    key: string;
    label?: string;
    labelModifier?(): React.ReactNode;
    defaultSortOrder?: 'asc' | 'dsc';
    modifier?(data: Data): React.ReactNode;
    sortable?: boolean;
    order: number;
    comparator?(a: Data, b: Data): number;
}

interface Props<Data> {
    className?: string;

    headers: Header<Data>[];
    data: Data[];

    defaultSort?: {
        key: string,
        order: number,
    };

    dataModifier?(data: Data, key: string): React.ReactNode;
    headerModifier?(header: Header<Data>, headers: Header<Data>[]): React.ReactNode;

    expandRowId?: string | number;
    expandedRowModifier?(data: Data): React.ReactNode;

    keySelector(data: Data): string | number;

    onBodyClick?(rowKey: string, cellKey: string): void; // FIXME: third props is event

    highlightCellKey?: {
        rowKey: string | number;
        columnKey: string | number;
    };
    highlightColumnKey?: string | number;
    highlightRowKey?: string | number;

    onDataSort?(data: Data[]): void;
    emptyComponent?: React.ReactNode;
}

// eslint-disable-next-line react/prefer-stateless-function, @typescript-eslint/no-explicit-any
declare class Table<D> extends React.Component<Props<D>, any> {
}
export default Table;
