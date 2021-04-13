import * as React from 'react';

// eslint-disable-next-line @typescript-eslint/ban-types
declare function modalize<T extends object>(
    component: (props: T) => JSX.Element,
): React.ReactComponent<T & { modal: React.ReactElement; initialShowModal?: boolean }>;

export default modalize;
