import React, { useState, useMemo, useCallback } from 'react';
import {
    _cs,
    BS,
    AD,
    Miti,
} from '@togglecorp/fujs';
import Button from '../../../Action/Button';
import Cell from '../Cell';

import styles from './styles.scss';

const months = [
    'Baisakh',
    'Jestha',
    'Ashad',
    'Shrawan',
    'Bhadra',
    'Ashoj',
    'Kartik',
    'Mangsir',
    'Poush',
    'Magh',
    'Falgun',
    'Chaitra',
];

function getTodayMiti() {
    const today = new Date();
    const englishMiti = new Miti(
        today.getFullYear(),
        today.getMonth() + 1,
        today.getDate(),
        AD,
    );
    const nepaliMiti = englishMiti.convertTo(BS);
    return nepaliMiti;
}

function getValueMiti(value: string) {
    const [y, m, d] = value
        ? value.split('-').map(item => +item)
        : [];
    const englishMiti = new Miti(y, m, d, AD);
    const nepaliMiti = englishMiti.convertTo(BS);
    return nepaliMiti;
}

interface YearModeProps {
    onChange: (value: number) => void;
    className?: string;
}
const YearMode = (props: YearModeProps) => {
    const { onChange, className } = props;

    const minYear = BS.getMinYmd().getYear();
    const maxYear = BS.getMaxYmd().getYear();

    const cells = useMemo(
        () => [...new Array(maxYear - minYear + 1)],
        [maxYear, minYear],
    );

    return (
        <div className={_cs(styles.calendar, className)}>
            <div className={styles.body}>
                {cells.map((_, index) => (
                    <Cell
                        key={`year-${String(index + minYear)}`}
                        cellKey={index + minYear}
                        onClick={onChange}
                    >
                        {index + minYear}
                    </Cell>
                ))}
            </div>
        </div>
    );
};

interface MonthModeProps {
    onChange: (value: number) => void;
    className?: string;
}
const MonthMode = (props: MonthModeProps) => {
    const { onChange, className } = props;

    return (
        <div className={_cs(styles.calendar, className)}>
            <div className={styles.body}>
                {months.map((month, index) => (
                    <Cell
                        key={month}
                        cellKey={index + 1}
                        onClick={onChange}
                    >
                        {month}
                    </Cell>
                ))}
            </div>
        </div>
    );
};

interface CalendarProps {
    className?: string;
    disabled?: boolean;
    onChange: (value: string | undefined) => void;
    readOnly?: boolean;
    value?: string;
}

const Calendar = (props: CalendarProps) => {
    const {
        className,
        disabled,
        onChange,
        readOnly,
        value,
    } = props;

    const todayMiti = useMemo(
        () => getTodayMiti(),
        [],
    );
    const valueMiti = useMemo(
        () => (
            value ? getValueMiti(value) : undefined
        ),
        [value],
    );
    const currentMiti = useMemo(
        () => valueMiti || todayMiti,
        [valueMiti, todayMiti],
    );


    const [currentYear, setCurrentYear] = useState(currentMiti.getYear());
    const [currentMonth, setCurrentMonth] = useState(currentMiti.getMonth());
    const [mode, setMode] = useState<'year' | 'month' | 'day'>('day');

    const calendarAttributes = useMemo(
        () => {
            const firstMiti = new Miti(currentYear, currentMonth, 1, BS);

            const week = firstMiti.getWeek();
            const emptySpaces = [...new Array(week - 1)];

            const totalDays = firstMiti.getDaysInCurrentMonth();
            const cells = [...new Array(totalDays)];
            return {
                // firstMiti,
                emptySpaces,
                cells,
            };
        },
        [currentMonth, currentYear],
    );

    const {
        // firstMiti,
        // week,
        emptySpaces,
        // totalDays,
        cells,
    } = calendarAttributes;

    const handleClick = useCallback(
        (newDay: number) => {
            const nepaliMiti = new Miti(currentYear, currentMonth, newDay, BS);
            const englishMiti = nepaliMiti.convertTo(AD);
            onChange(englishMiti.getString());
        },
        [currentMonth, currentYear, onChange],
    );

    const handleSetToday = useCallback(
        () => {
            setCurrentYear(todayMiti.getYear());
            setCurrentMonth(todayMiti.getMonth());

            const englishMiti = todayMiti.convertTo(AD);
            onChange(englishMiti.getString());
        },
        [onChange, todayMiti],
    );

    const handleClear = useCallback(
        () => {
            onChange(undefined);
        },
        [onChange],
    );

    const handleMonthDecrease = useCallback(
        () => {
            if (currentMonth <= 1) {
                setCurrentMonth(12);
                setCurrentYear(currentYear - 1);
            } else {
                setCurrentMonth(currentMonth - 1);
            }
        },
        [currentMonth, currentYear],
    );

    const handleMonthIncrease = useCallback(
        () => {
            if (currentMonth >= 12) {
                setCurrentMonth(1);
                setCurrentYear(currentYear + 1);
            } else {
                setCurrentMonth(currentMonth + 1);
            }
        },
        [currentMonth, currentYear],
    );

    const setYearMode = useCallback(
        () => {
            setMode('year');
        },
        [],
    );

    const handleYearModeChange = useCallback(
        (year: number) => {
            setCurrentYear(year);
            setMode('month');
        },
        [],
    );

    const handleMonthModeChange = useCallback(
        (month: number) => {
            setCurrentMonth(month);
            setMode('day');
        },
        [],
    );

    if (mode === 'year') {
        return (
            <YearMode
                onChange={handleYearModeChange}
            />
        );
    }
    if (mode === 'month') {
        return (
            <MonthMode
                onChange={handleMonthModeChange}
            />
        );
    }

    return (
        <div className={_cs(styles.calendar, className)}>
            <div className={styles.header}>
                <div
                    className={styles.yearMonth}
                    tabIndex={-1}
                    role="button"
                    onClick={setYearMode}
                    onKeyDown={setYearMode}
                >
                    {`${currentYear} ${months[currentMonth - 1]}`}
                </div>
                <Button
                    onClick={handleMonthDecrease}
                    transparent
                    disabled={
                        // for BS, minDate starts in between so skipping that year
                        currentYear <= (BS.getMinYmd().getYear() + 1)
                        && currentMonth <= 1
                    }
                    iconName="chevronLeft"
                    title="Previous"
                />
                <Button
                    onClick={handleMonthIncrease}
                    transparent
                    disabled={
                        currentYear >= BS.getMaxYmd().getYear()
                        && currentMonth >= 12
                    }
                    title="Next"
                    iconName="chevronRight"
                />
            </div>
            <div className={styles.subHeader}>
                <Cell>Su</Cell>
                <Cell>Mo</Cell>
                <Cell>Tu</Cell>
                <Cell>We</Cell>
                <Cell>Th</Cell>
                <Cell>Fr</Cell>
                <Cell>Sa</Cell>
            </div>
            <div className={styles.body}>
                {emptySpaces.map((_, index) => (
                    <Cell key={`empty-${String(index + 1)}`} />
                ))}
                {cells.map((_, index) => (
                    <Cell
                        key={`fill-${String(index + 1)}`}
                        selected={
                            valueMiti
                            && currentYear === valueMiti.getYear()
                            && currentMonth === valueMiti.getMonth()
                            && index + 1 === valueMiti.getDay()
                        }
                        today={
                            currentYear === todayMiti.getYear()
                            && currentMonth === todayMiti.getMonth()
                            && index + 1 === todayMiti.getDay()
                        }
                        cellKey={index + 1}
                        onClick={handleClick}
                        disabled={disabled}
                        readOnly={readOnly}
                    >
                        {index + 1}
                    </Cell>
                ))}
            </div>
            <div className={styles.footer}>
                <Button
                    onClick={handleSetToday}
                    disabled={
                        disabled
                        || readOnly
                        || (valueMiti && todayMiti.isEqual(valueMiti))
                    }
                >
                    Set today
                </Button>
                <Button
                    onClick={handleClear}
                    disabled={disabled || readOnly || !value}
                >
                    Clear
                </Button>
            </div>
        </div>
    );
};

export default Calendar;
