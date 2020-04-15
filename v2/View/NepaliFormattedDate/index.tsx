import React, { useMemo } from 'react';

import {
    BS,
    AD,
    Miti,
    _cs,
    padStart,
} from '@togglecorp/fujs';

import styles from './styles.scss';

function getValueMiti(value: string | number, lang: 'en' | 'np') {
    const date = new Date(value);
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();

    const englishMiti = new Miti(y, m, d, AD);

    if (lang === 'np') {
        const nepaliMiti = englishMiti.convertTo(BS);
        return nepaliMiti;
    }
    return englishMiti;
}

interface Props {
    style?: React.CSSProperties;
    className?: string;
    value?: string | number;
    lang?: 'en' | 'np';
    dateTransformer?: (value: string) => string | number;
    timeTransformer?: (value: string) => string | number;
    timeShown?: boolean;
}

const NepaliFormattedDate = (props: Props) => {
    const {
        value,
        className,
        lang = 'np',
        dateTransformer,
        style,
        timeTransformer,
        timeShown,
    } = props;

    const containerClassName = _cs(
        className,
        'nepali-formatted-date',
        styles.nepaliFormattedDate,
    );

    const miti = useMemo(
        () => (
            value ? getValueMiti(value, lang) : undefined
        ),
        [value, lang],
    );

    const [hour, minute] = useMemo(
        () => {
            if (!value) {
                return ['00', '00'];
            }
            const date = new Date(value);
            const hh = date.getHours();
            const mm = date.getMinutes();
            return [padStart(hh, 2), padStart(mm, 2)];
        },
        [value],
    );

    if (!miti) {
        return (
            <div className={containerClassName}>
                -
            </div>
        );
    }

    const year = padStart(miti.getYear(), 4);
    const month = padStart(miti.getMonth(), 2);
    const day = padStart(miti.getDay(), 2);

    return (
        <time
            className={containerClassName}
            style={style}
        >
            <span className="date">
                {dateTransformer ? dateTransformer(year) : year}
            </span>
            <span className="separator">
                -
            </span>
            <span className="date">
                {dateTransformer ? dateTransformer(month) : month}
            </span>
            <span className="separator">
                -
            </span>
            <span className="date">
                {dateTransformer ? dateTransformer(day) : day}
            </span>
            {timeShown && (
                <>
                    <span className={_cs('separator', styles.separator)} />
                    <span className="time">
                        {timeTransformer ? timeTransformer(hour) : hour}
                    </span>
                    <span className="separator">
                        :
                    </span>
                    <span className="time">
                        {timeTransformer ? timeTransformer(minute) : minute}
                    </span>
                </>
            )}
        </time>
    );
};

export default NepaliFormattedDate;
