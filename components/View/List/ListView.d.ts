import * as React from 'react';
import { ListProps } from '../List';

interface Props {
    className?: string;
    emptyComponent?: React.ReactNode;
}

declare class ListView<T> extends React.Component<Props & ListProps<T>, any> {
}
export default ListView;
