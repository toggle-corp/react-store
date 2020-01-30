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

interface AnotherProps<T, Q, R> {
    rendererClassName?: string;
    rendererParams?: (key: R, data: T, index: number) => Q;
    renderer?: React.ComponentType<Q> | ((props: Q) => React.ReactNode);

    // NOTE: these are faram props
    faramElement: boolean;
}

interface Props<T, Q, R> {
    data?: T[];
    keySelector(datum: T, index: number): R;
    rendererClassName?: string;
    rendererParams?: (key: R, data: T, index: number) => Q;
    renderer?: React.ComponentType<Q> | ((props: Q) => React.ReactNode);
    pending?: boolean;
}

export type ListProps<T, Q, R> = (Props<T, Q, R> | AnotherProps<T, Q, R>) & ExternalProps;

// eslint-disable-next-line react/prefer-stateless-function
declare class List<T, Q, R> extends React.Component<ListProps<T, Q, R>, any> {
}
export default List;
