import * as React from 'react';
import { ExternalProps } from '../Input/Faram/FaramElement';

interface Props<T> {
    data?: T[];
    keyExtractor?(datum: T, index: number): string;
    modifier?(key: string, dataum: T, i: number, data: T[]): React.ReactNode;
}

export type ListProps<T> = Props<T> & ExternalProps;

declare class List<T> extends React.Component<ListProps<T>, any> {
}
export default List;
