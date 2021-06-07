import * as React from 'react';

interface Props {
    className?: string;
    value?: string | number | Date;
    title?: string;
    mode: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    emptyComponent?: React.ReactType<any>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare class FormattedDate extends React.PureComponent<Props, any> {
}
export default FormattedDate;
