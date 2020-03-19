import React, { useMemo, useCallback, useState } from 'react';
import {
    BS,
    AD,
    Miti,
    _cs,
} from '@togglecorp/fujs';

import Button from '../../Action/Button';
import FloatingContainer from '../../View/FloatingContainer';
import HintAndError from '../HintAndError';
import Label from '../Label';

import Calendar from './Calendar';
import Input from './Input';
import useFloatingContainer from './useFloatingContainer';
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


// TODO:
// 1. support range
// 2. support starting week
// 3. support holidays
// 4. support min / max value

interface Props {
    className?: string;
    labelClassName?: string;
    disabled: boolean;
    error?: string;
    hint?: string;
    label?: string;
    onChange: (value: string | undefined) => void;
    readOnly: boolean;
    showHintAndError: boolean;
    showLabel: boolean;
    title?: string;
    value?: string;
    labelRightComponent?: React.ReactNode;
    labelRightComponentClassName?: string;
    hideClearButton?: boolean;
}

const NepaliDateInput = (props: Props) => {
    const {
        className,
        disabled,
        error,
        hint,
        label,
        showHintAndError,
        showLabel,

        title,
        labelClassName,
        labelRightComponent,
        labelRightComponentClassName,
        value,
        readOnly,
        onChange,
        hideClearButton,
    } = props;

    const [containerRef, handleOptionsInvalidate] = useFloatingContainer();

    const [calendarShown, setCalendarShown] = useState(false);

    const valueMiti = useMemo(
        () => (
            value ? getValueMiti(value) : undefined
        ),
        [value],
    );

    const todayMiti = useMemo(
        () => getTodayMiti(),
        [],
    );

    const handleCalendarShow = useCallback(
        () => {
            setCalendarShown(true);
        },
        [],
    );
    const handleCalendarHide = useCallback(
        () => {
            setCalendarShown(false);
        },
        [],
    );

    const handleChange = useCallback(
        (date: string | undefined) => {
            onChange(date);
            setCalendarShown(false);
        },
        [onChange],
    );

    const handleClear = useCallback(
        () => {
            handleChange(undefined);
        },
        [handleChange],
    );

    const handleSetToday = useCallback(
        () => {
            const englishMiti = todayMiti.convertTo(AD);
            handleChange(englishMiti.getString());
        },
        [handleChange, todayMiti],
    );

    return (
        <div
            className={_cs(className, styles.nepaliDateInput)}
            title={title}
        >
            {showLabel && (
                <Label
                    className={_cs(styles.label, labelClassName)}
                    disabled={disabled}
                    error={!!error}
                    title={label}
                    rightComponent={labelRightComponent}
                    rightComponentClassName={labelRightComponentClassName}
                >
                    {label}
                </Label>
            )}
            <div
                className={_cs(styles.inputContainer, 'input-container')}
                ref={containerRef}
            >
                <Input
                    value={valueMiti}
                    onChange={handleChange}
                    disabled={disabled}
                    readOnly={readOnly}
                />
                <div className={styles.actions}>
                    <Button
                        className={styles.calendarButton}
                        iconName="calendar"
                        title="Show calendar"
                        transparent
                        onClick={handleCalendarShow}
                        smallHorizontalPadding
                        smallVerticalPadding
                        disabled={disabled || readOnly}
                        tabIndex={-1}
                    />
                    <Button
                        className={styles.todayButton}
                        iconName="clock"
                        title="Set today"
                        transparent
                        onClick={handleSetToday}
                        smallHorizontalPadding
                        smallVerticalPadding
                        disabled={
                            disabled
                            || readOnly
                            || (valueMiti && todayMiti.isEqual(valueMiti))
                        }
                        tabIndex={-1}
                    />
                    {!hideClearButton && (
                        <Button
                            className={styles.clearButton}
                            smallHorizontalPadding
                            smallVerticalPadding
                            iconName="close"
                            transparent
                            title="Clear"
                            onClick={handleClear}
                            disabled={disabled || readOnly || !value}
                            tabIndex={-1}
                        />
                    )}
                </div>
            </div>
            {calendarShown && (
                <FloatingContainer
                    onBlur={handleCalendarHide}
                    onInvalidate={handleOptionsInvalidate}
                    parentRef={containerRef}
                >
                    <Calendar
                        disabled={disabled}
                        readOnly={readOnly}
                        onChange={handleChange}
                        valueMiti={valueMiti}
                        todayMiti={todayMiti}
                        hideClearButton={hideClearButton}
                    />
                </FloatingContainer>
            )}
            {showHintAndError && (
                <HintAndError
                    error={error}
                    hint={hint}
                />
            )}
        </div>
    );
};

NepaliDateInput.defaultProps = {
    disabled: false,
    readOnly: false,
    showHintAndError: true,
    showLabel: true,
};

export default NepaliDateInput;
