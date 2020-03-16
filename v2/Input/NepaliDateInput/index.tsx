import React, { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import {
    BS,
    AD,
    Miti,
    _cs,
} from '@togglecorp/fujs';

import {
    calcFloatPositionInMainWindow,
    defaultLimit,
    defaultOffset,
} from '../../../utils/bounds';
import Button from '../../Action/Button';
import FloatingContainer from '../../View/FloatingContainer';
import HintAndError from '../HintAndError';
import Label from '../Label';

import Calendar from './Calendar';
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
// 5. support year/month jump

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

    const containerRef = useRef<HTMLDivElement>(null);

    const boundingClientRect = useRef<ClientRect>();

    useEffect(
        () => {
            const { current: container } = containerRef;
            if (container) {
                boundingClientRect.current = container.getBoundingClientRect();
            }
        },
        [containerRef],
    );

    const handleOptionsInvalidate = useCallback(
        (optionsContainer: HTMLDivElement) => {
            const contentRect = optionsContainer.getBoundingClientRect();

            const { current: container } = containerRef;
            const parentRect = container
                ? container.getBoundingClientRect()
                : boundingClientRect.current;

            const offset = { ...defaultOffset };

            const limit = { ...defaultLimit };
            if (parentRect) {
                limit.minW = 240;
                limit.maxW = 240;
            }

            const optionsContainerPosition = calcFloatPositionInMainWindow({
                parentRect,
                contentRect,
                offset,
                limit,
            });

            return optionsContainerPosition;
        },
        [containerRef, boundingClientRect],
    );

    const valueMiti = useMemo(
        () => (
            value ? getValueMiti(value) : undefined
        ),
        [value],
    );

    const nepaliMitiText = useMemo(
        () => {
            if (!valueMiti) {
                return undefined;
            }
            return valueMiti.convertTo(BS).getString();
        },
        [valueMiti],
    );

    const todayMiti = useMemo(
        () => getTodayMiti(),
        [],
    );

    const [calendarShown, setCalendarShown] = useState(false);

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
                <div
                    className={_cs(styles.date, !nepaliMitiText && styles.empty)}
                    onClick={handleCalendarShow}
                    onKeyDown={handleCalendarShow}
                    tabIndex={-1}
                    role="button"
                >
                    {nepaliMitiText || 'yyyy-mm-dd'}
                </div>
                <div className={styles.actions}>
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
