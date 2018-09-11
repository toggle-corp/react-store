import * as React from 'react';

export type WrappedComponentFactory<T> = (props: T) => JSX.Element;
export type WrappedComponent<T> = React.ComponentClass<T> | WrappedComponentFactory<T>;

declare function boundError<S, T>(
    errorComponent: React.ComponentClass<S>,
): (wrappedComponent: WrappedComponent<T>) => React.ComponentClass<T>;

export default boundError;
