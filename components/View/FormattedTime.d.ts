import * as React from 'react';

interface Props {
    className?: string;
    value?: string;
    mode: string;
    emptyComponent?: React.ReactType<any>;
}

declare class FormattedTime extends React.PureComponent<Props, any> {
}
export default FormattedTime;
