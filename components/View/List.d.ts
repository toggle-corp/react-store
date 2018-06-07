import * as React from 'react';
import { ExternalProps } from '../Input/Faram/FaramElement';

interface RendererProps<T> {
    className: string;
    key: string | undefined;
    datum: T;
    index: number;
    data: T[];
}

interface Props<T> {
    data?: T[];
    keyExtractor?(datum: T, index: number): string;
    // FIXME: key should not be undefined
    modifier?(key: string | undefined, dataum: T, i: number, data: T[]): React.ReactNode;
}

export type ListProps<T> = Props<T> & ExternalProps;

declare class List<T> extends React.Component<ListProps<T>, any> {
}
export default List;
