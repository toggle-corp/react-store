import PropTypes from 'prop-types';
import React from 'react';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};


export default class DaysHeader extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    static dayNames = [
        { key: 'sunday', value: 'S' },
        { key: 'monday', value: 'M' },
        { key: 'tuesday', value: 'T' },
        { key: 'wednesday', value: 'W' },
        { key: 'thursday', value: 'T' },
        { key: 'friday', value: 'F' },
        { key: 'saturday', value: 'S' },
    ];

    render() {
        const { className } = this.props;
        return (
            <div className={`days-header ${className}`}>
                {
                    DaysHeader.dayNames.map(d => (
                        <span
                            className="day"
                            key={d.key}
                        >
                            {d.value}
                        </span>
                    ))
                }
            </div>
        );
    }
}
