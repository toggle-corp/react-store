import * as React from 'react';

declare function modalize<T extends object>(
    component: (props: T) => JSX.Element,
): React.ReactComponent<T & { modal: React.ReactElement; initialShowModal?: boolean }>;

export default modalize;
