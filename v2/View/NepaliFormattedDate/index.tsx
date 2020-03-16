import React, { useMemo } from 'react';

import {
    BS,
    AD,
    Miti,
    _cs,
} from '@togglecorp/fujs';

import styles from './styles.scss';

function getValueMiti(value: string | number) {
    const date = new Date(value);
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();

    const englishMiti = new Miti(y, m, d, AD);
    const nepaliMiti = englishMiti.convertTo(BS);
    return nepaliMiti;
}

interface Props {
    className?: string;
    value?: string | number;
}

const NepaliFormattedDate = (props: Props) => {
    const {
        value,
        className,
    } = props;

    const containerClassName = _cs(
        className,
        'nepali-formatted-date',
        styles.nepaliFormattedDate,
    );

    const miti = useMemo(
        () => (
            value ? getValueMiti(value) : undefined
        ),
        [value],
    );

    if (!miti) {
        return (
            <div className={containerClassName}>
                -
            </div>
        );
    }

    return (
        <time className={containerClassName}>
            <span className="date">
                {miti.getYear()}
            </span>
            <span className="separator">
                -
            </span>
            <span className="date">
                {miti.getMonth()}
            </span>
            <span className="separator">
                -
            </span>
            <span className="date">
                {miti.getDay()}
            </span>
        </time>
    );
};

export default NepaliFormattedDate;
