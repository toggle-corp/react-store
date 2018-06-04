import * as React from 'react';

interface Props {
    active?: boolean;
    children?: React.ReactNode;
    className?: string;
    scrollIntoView?: boolean;
}

declare class ListItem extends React.Component<Props, any> {
}
export default ListItem;
