import React, { useState } from 'react';
import {
    isNotDefined,
    isDefined,
    _cs,
    BS,
    AD,
    Miti,
} from '@togglecorp/fujs';

import HintAndError from '../HintAndError';
import Button from '../../Action/Button';
import Label from '../Label';

import styles from './styles.scss';

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

interface CellProps {
    cellKey?: number;
    onClick?: (value: number) => void;
    selected?: boolean;
    today?: boolean;
    children?: React.ReactNode;
    className?: string;

    disabled?: boolean;
    readOnly?: boolean;
}

const month = [
    'Baiskah',
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

const Cell = (props: CellProps) => {
    const {
        children,
        className,

        today,
        selected,
        onClick,

        cellKey,

        disabled,
        readOnly,
    } = props;

    // TODO: use useCallback
    const handleClick = () => {
        // NOTE: div cannot be disabled
        if (isDefined(onClick) && isDefined(cellKey) && !disabled && !readOnly) {
            onClick(cellKey);
        }
    };

    return (
        <div
            className={_cs(
                className,
                styles.cell,
                today && styles.today,
                selected && styles.selected,
            )}
            role="button"
            onClick={handleClick}
            onKeyDown={handleClick}
            tabIndex={-1}
        >
            {children}
        </div>
    );
};


interface Props {
    className?: string;
    labelClassName?: string;
    disabled?: boolean;
    error?: string;
    hint?: string;
    label?: string;
    onChange: (value: string | undefined) => void;
    readOnly?: boolean;
    showHintAndError: boolean;
    showLabel: boolean;
    title?: string;
    value?: string;
    labelRightComponent?: React.ReactNode;
    labelRightComponentClassName?: string;
}

const CalendarInput = (props: Props) => {
    const {
        className,
        disabled,
        error,
        hint,
        label,
        onChange,
        readOnly,
        showHintAndError,
        showLabel,
        title,
        value,
        labelClassName,
        labelRightComponent,
        labelRightComponentClassName,
    } = props;

    const todayMiti = getTodayMiti();

    const valueMiti = value
        ? getValueMiti(value)
        : undefined;

    const currentMiti = valueMiti || todayMiti;
    const [currentYear, setCurrentYear] = useState(currentMiti.getYear());
    const [currentMonth, setCurrentMonth] = useState(currentMiti.getMonth());

    const firstMiti = new Miti(currentYear, currentMonth, 1, BS);

    // TODO: memoize this
    const week = firstMiti.getWeek();
    const emptySpaces = [...new Array(week - 1)];

    // TODO: memoize this
    const totalDays = firstMiti.getDaysInCurrentMonth();
    const cells = [...new Array(totalDays)];

    // TODO: use useCallback
    const handleClick = (newDay: number) => {
        const nepaliMiti = new Miti(currentYear, currentMonth, newDay, BS);
        const englishMiti = nepaliMiti.convertTo(AD);
        onChange(englishMiti.getString());
    };

    // TODO: use useCallback
    const handleSetToday = () => {
        setCurrentYear(todayMiti.getYear());
        setCurrentMonth(todayMiti.getMonth());

        const englishMiti = todayMiti.convertTo(AD);
        onChange(englishMiti.getString());
    };

    // TODO: use useCallback
    const handleClear = () => {
        onChange(undefined);
    };

    // TODO: use useCallback
    const handleMonthDecrease = () => {
        if (currentMonth <= 1) {
            setCurrentMonth(12);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    // TODO: use useCallback
    const handleMonthIncrease = () => {
        if (currentMonth >= 12) {
            setCurrentMonth(1);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    // TODO: support date range
    // TODO: jump to certain year and month

    return (
        <div
            className={className}
            title={title}
        >
            {showLabel && (
                <Label
                    className={labelClassName}
                    disabled={disabled}
                    error={!!error}
                    title={label}
                    rightComponent={labelRightComponent}
                    rightComponentClassName={labelRightComponentClassName}
                >
                    {label}
                </Label>
            )}
            <div className={_cs(styles.calendar, className)}>
                <div className={styles.header}>
                    <div className={styles.year}>
                        {currentYear}
                    </div>
                    <div className={styles.month}>
                        {month[currentMonth - 1]}
                    </div>
                    <Button
                        onClick={handleMonthDecrease}
                        disabled={
                            // for BS, minDate starts in between so skipping that year
                            currentYear <= (BS.getMinYmd().getYear() + 1)
                            && currentMonth <= 1
                        }
                    >
                        Prev
                    </Button>
                    <Button
                        onClick={handleMonthIncrease}
                        disabled={
                            currentYear >= BS.getMaxYmd().getYear()
                            && currentMonth >= 12
                        }
                    >
                        Next
                    </Button>
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
                <div className={styles.subHeader}>
                    <Cell>Sun</Cell>
                    <Cell>Mon</Cell>
                    <Cell>Tue</Cell>
                    <Cell>Wed</Cell>
                    <Cell>Thu</Cell>
                    <Cell>Fri</Cell>
                    <Cell>Sat</Cell>
                </div>
                <div className={styles.body}>
                    {emptySpaces.map((_, index) => (
                        <Cell />
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
            </div>
            {showHintAndError && (
                <HintAndError
                    error={error}
                    hint={hint}
                />
            )}
        </div>
    );
};

CalendarInput.defaultProps = {
    disabled: false,
    readOnly: false,
    showHintAndError: true,
    showLabel: true,
};

export default CalendarInput;
