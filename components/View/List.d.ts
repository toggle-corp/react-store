import * as React from 'react';

// import { ExternalProps } from '../General/Form/FormElement';
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ExternalProps {
}

interface RendererProps<T> {
    className: string;
    key: string | undefined;
    datum: T;
    index: number;
    data: T[];
}

interface Props<T, Q> {
    data?: T[];
    keySelector?(datum: T, index: number): string;
    rendererClassName?: string;
    rendererParams?: (key: string, data: T) => Q;
    renderer?: React.ComponentType<Q> | ((props: Q) => React.ReactNode);
}

export type ListProps<T, Q> = Props<T, Q> & ExternalProps;

declare class List<T, Q> extends React.Component<ListProps<T, Q>, any> {
}
export default List;
