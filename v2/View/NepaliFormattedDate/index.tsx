import React, { useMemo } from 'react';

import {
    BS,
    AD,
    Miti,
    _cs,
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
    className?: string;
    value?: string | number;
    lang?: 'en' | 'np';
    dateTransformer?: (value: number) => string | number;
    // timeTransformer?: (value: number) => string | number;
}

const NepaliFormattedDate = (props: Props) => {
    const {
        value,
        className,
        lang = 'np',
        dateTransformer,
        // timeTransformer,
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

    if (!miti) {
        return (
            <div className={containerClassName}>
                -
            </div>
        );
    }

    const year = miti.getYear();
    const month = miti.getMonth();
    const day = miti.getDay();

    return (
        <time className={containerClassName}>
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
        </time>
    );
};

export default NepaliFormattedDate;
