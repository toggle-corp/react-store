import React, { useState, useMemo, useCallback } from 'react';
import {
    _cs,
    BS,
    AD,
    Miti,
} from '@togglecorp/fujs';
import Button from '../../../Action/Button';
import Cell from './Cell';

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

interface YearModeProps {
    onChange: (value: number) => void;
    className?: string;
    year: number;
}

const YearMode = (props: YearModeProps) => {
    const { onChange, className, year } = props;

    const minYear = BS.getMinYmd().getYear();
    const maxYear = BS.getMaxYmd().getYear();

    const cells = useMemo(
        () => [...new Array(maxYear - minYear + 1)],
        [maxYear, minYear],
    );

    return (
        <div className={_cs(styles.yearCalendar, className)}>
            <header className={styles.header}>
                <h3 className={styles.heading}>
                    Select year
                </h3>
            </header>
            <div className={styles.content}>
                {cells.map((_, index) => (
                    <Cell
                        key={`year-${String(index + minYear)}`}
                        cellKey={index + minYear}
                        onClick={onChange}
                        scrollIntoView={year === index + minYear}
                        selected={year === index + minYear}
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
    year: number;
    month: number;
}
const MonthMode = (props: MonthModeProps) => {
    const {
        onChange,
        className,
        year,
        month: monthFromProps,
    } = props;

    return (
        <div className={_cs(styles.monthCalendar, className)}>
            <header className={styles.header}>
                <h3 className={styles.heading}>
                    {`Select Month for ${year}`}
                </h3>
            </header>
            <div className={styles.content}>
                {months.map((month, index) => (
                    <Cell
                        key={month}
                        cellKey={index + 1}
                        onClick={onChange}
                        selected={monthFromProps === index + 1}
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
    valueMiti?: Miti;
    todayMiti: Miti;
    hideClearButton?: boolean;
}

const Calendar = (props: CalendarProps) => {
    const {
        className,
        disabled,
        onChange,
        readOnly,
        valueMiti,
        todayMiti,
        hideClearButton,
    } = props;

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
                year={currentYear}
                onChange={handleYearModeChange}
            />
        );
    }
    if (mode === 'month') {
        return (
            <MonthMode
                month={currentMonth}
                year={currentYear}
                onChange={handleMonthModeChange}
            />
        );
    }

    return (
        <div className={_cs(styles.dateCalendar, className)}>
            <header className={styles.header}>
                <Button
                    className={styles.yearMonth}
                    onClick={setYearMode}
                    transparent
                >
                    {`${currentYear} ${months[currentMonth - 1]}`}
                </Button>
                <div className={styles.actions}>
                    <Button
                        className={styles.prevButton}
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
                        className={styles.nextButton}
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
            </header>
            <div className={styles.content}>
                <Cell>Su</Cell>
                <Cell>Mo</Cell>
                <Cell>Tu</Cell>
                <Cell>We</Cell>
                <Cell>Th</Cell>
                <Cell>Fr</Cell>
                <Cell>Sa</Cell>
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
            <footer className={styles.footer}>
                <Button
                    onClick={handleSetToday}
                    transparent
                    disabled={
                        disabled
                        || readOnly
                        || (valueMiti && todayMiti.isEqual(valueMiti))
                    }
                >
                    Set today
                </Button>
                {hideClearButton && (
                    <Button
                        transparent
                        onClick={handleClear}
                        disabled={disabled || readOnly || !valueMiti}
                    >
                        Clear
                    </Button>
                )}
            </footer>
        </div>
    );
};

export default Calendar;
