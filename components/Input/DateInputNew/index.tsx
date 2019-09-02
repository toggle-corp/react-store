import React from 'react';

interface Props {
    className?: string;
}

interface State {
}

class DateInput extends React.PureComponent<Props, State> {
    public render() {
        const {
            className,
        } = this.props;

        return (
            <div className={className}>
                <input type="date" />
            </div>
        );
    }
}

export default DateInput;
