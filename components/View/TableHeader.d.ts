import * as React from 'react';

type SortOrder = 'asc' | 'dsc';

interface Props {
    className?: string;
    label: React.ReactNode;
    sortOrder?: SortOrder;
    sortable?: boolean;
}

declare class TableHeader extends React.Component<Props, any> {
}
export default TableHeader;
