import PropTypes from 'prop-types';
import React from 'react';

import { insertValues, breakFormat } from '../../../utils/date';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,

    /**
     * Timestamp
     */
    date: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
    ]),
    /**
     * Options
     */
    mode: PropTypes.string,

    emptyComponent: PropTypes.func,
};

const defaultProps = {
    className: '',
    date: undefined,
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
        insertValues(breakFormat(mode), date)
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
                } else if (e.type === 'time') {
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
            date,
            mode,
            className,
            emptyComponent: Empty,
        } = this.props;

        const containerClassName = [
            className,
            'formatted-date',
            styles.formattedDate,
        ].join(' ');

        if (!date) {
            return (
                <div className={containerClassName}>
                    { Empty && <Empty />}
                </div>
            );
        }

        const children = FormattedDate.formatDate(new Date(date), mode);
        return (
            <time className={containerClassName}>
                { children }
            </time>
        );
    }
}
