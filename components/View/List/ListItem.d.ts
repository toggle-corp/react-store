import * as React from 'react';

interface Props {
    active?: boolean;
    children?: React.ReactNode;
    className?: string;
    scrollIntoView?: boolean;
}

// eslint-disable-next-line react/prefer-stateless-function, @typescript-eslint/no-explicit-any
declare class ListItem extends React.Component<Props, any> {
}
export default ListItem;
