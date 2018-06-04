import * as React from 'react';

export interface ExternalProps {
    faramElementName?: string;
    faramElementIndex?: number;
    forwardedRef?: any;
    faramAction?: string;
    faramElement?: boolean;
}

export interface InjectedProps {
}

/*
FIXME: use this later
declare function hoc<OriginalProps>(name: string): (
  component: React.ComponentType<OriginalProps & InjectedProps>,
) => React.Component<OriginalProps & ExternalProps>;

export default hoc;
 */
