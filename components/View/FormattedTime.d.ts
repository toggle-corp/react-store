import * as React from 'react';

interface Props {
    className?: string;
    value?: string;
    mode: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    emptyComponent?: React.ReactType<any>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare class FormattedTime extends React.PureComponent<Props, any> {
}
export default FormattedTime;
