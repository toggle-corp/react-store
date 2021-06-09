import * as React from 'react';

type SortOrder = 'asc' | 'dsc';

interface Props {
    className?: string;
    label: React.ReactNode;
    sortOrder?: SortOrder;
    sortable?: boolean;
}

// eslint-disable-next-line react/prefer-stateless-function, @typescript-eslint/no-explicit-any
declare class TableHeader extends React.Component<Props, any> {
}
export default TableHeader;
