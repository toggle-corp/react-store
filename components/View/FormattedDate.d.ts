import * as React from 'react';

interface Props {
    className?: string;
    value?: string | number | Date;
    mode: string;
    emptyComponent?: React.ReactType<any>;
}

declare class FormattedDate extends React.PureComponent<Props, any> {
}
export default FormattedDate;
