import * as React from 'react';

interface DefaultHeader {
    key: string;
    label: string;
}

interface Props<Data, Header = DefaultHeader> {
    className?: string;

    headers: Header[];
    data: Data[];

    dataModifier?(data: Data, key: string): React.ReactNode;
    headerModifier?(header: Header, headers: Header[]): React.ReactNode;

    expandRowId?: string | number;
    expandedRowModifier?(data: Data): React.ReactNode;

    keyExtractor(data: Data): string | number;

    onBodyClick?(rowKey: string, cellKey: string): void; // FIXME: third props is event
    onHeaderClick?(key: string | number): void; // FIXME: second props is event

    highlightCellKey?: {
        rowKey: string | number;
        columnKey: string | number;
    };
    highlightColumnKey?: string | number;
    highlightRowKey?: string | number;

    onDataSort?(data: Data[]): void;
}

declare class RawTable<D, H> extends React.Component<Props<D, H>, any> {
}
export default RawTable;
