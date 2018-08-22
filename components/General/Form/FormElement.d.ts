import * as React from 'react';

export interface ExternalProps {
    forwardedRef?: any;
    faramElementName?: string;
    faramElementIndex?: number;
    faramElement?: boolean;
    faramInfo?: any;
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
