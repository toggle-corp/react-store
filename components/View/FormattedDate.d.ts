import * as React from 'react';

interface Props {
    className?: string;
    value?: number | string | Date;
    mode?: string;
    emptyComponent?: () => React.ReactNode;
}

declare class FormattedDate extends React.Component<Props, any> {
}
export default FormattedDate;
