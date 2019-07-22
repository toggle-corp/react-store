import PropTypes from 'prop-types';
import React from 'react';

import { populateFormat, breakFormat } from '@togglecorp/fujs';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,

    /**
     * Timestamp
     */
    value: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
        PropTypes.instanceOf(Date),
    ]),
    /**
     * Options
     */
    mode: PropTypes.string,

    emptyComponent: PropTypes.func,
};

const defaultProps = {
    className: '',
    value: undefined,
    mode: 'dd-MM-yyyy',

    emptyComponent: () => '-',
};

/**
 * Show timestamp in Human Readable Format
 */
export default class FormattedDate extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    static formatDate = (date, mode) => (
        populateFormat(breakFormat(mode), date)
            .map((e, i) => {
                const key = String(i);
                if (e.type === 'date') {
                    return (
                        <span
                            className="date"
                            key={key}
                        >
                            {e.value}
                        </span>
                    );
                }
                if (e.type === 'time') {
                    return (
                        <span
                            className="time"
                            key={key}
                        >
                            {e.value}
                        </span>
                    );
                }
                return (
                    <span
                        className="separator"
                        key={key}
                    >
                        {e.value}
                    </span>
                );
            })
    );

    render() {
        const {
            value,
            mode,
            className,
            emptyComponent: Empty,
        } = this.props;

        const containerClassName = [
            className,
            'formatted-date',
            styles.formattedDate,
        ].join(' ');

        if (!value) {
            return (
                <div className={containerClassName}>
                    { Empty && <Empty />}
                </div>
            );
        }

        const children = FormattedDate.formatDate(new Date(value), mode);
        return (
            <time className={containerClassName}>
                { children }
            </time>
        );
    }
}
