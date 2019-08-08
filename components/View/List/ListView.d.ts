import * as React from 'react';
import { ListProps } from '../List';

interface Props {
    className?: string;
    emptyComponent?: React.ReactNode;
}

// eslint-disable-next-line react/prefer-stateless-function
declare class ListView<T, Q, R> extends React.Component<Props & ListProps<T, Q, R>, any> {
}
export default ListView;
