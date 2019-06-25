import * as React from 'react';
import { ListProps } from '../List';

interface Props {
    className?: string;
    emptyComponent?: React.ReactNode;
}

declare class ListView<T, Q> extends React.Component<Props & ListProps<T, Q>, any> {
}
export default ListView;
