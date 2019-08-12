import * as React from 'react';

interface DefaultHeader {
    key: string;
    label: React.ReactNode;
}

interface Props<Data, Header = DefaultHeader> {
    className?: string;
    pending?: boolean;
    isFiltered?: boolean;

    headers: Header[];
    data: Data[];

    dataModifier?(data: Data, key: keyof Data): React.ReactNode;
    headerModifier?(header: Header, headers: Header[]): React.ReactNode;

    expandRowId?: string | number;
    expandedRowModifier?(data: Data): React.ReactNode;

    keySelector(data: Data): string | number;

    onBodyClick?(rowKey: string, cellKey: string): void; // FIXME: third props is event
    onHeaderClick?(key: string | number): void; // FIXME: second props is event

    highlightCellKey?: {
        rowKey: string | number;
        columnKey: string | number;
    };
    highlightColumnKeys?: {
        [key: string]: boolean;
    };
    highlightRowKey?: string | number;

    onDataSort?(data: Data[]): void;
}

declare class RawTable<D, H> extends React.Component<Props<D, H>, any> {
}
export default RawTable;
