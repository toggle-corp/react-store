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

// FIXME: use from utils
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
}

const CalendarInput = (props: Props) => {
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
                limit.minW = parentRect.width;
                limit.maxW = parentRect.width;
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

    return (
        <div
            className={_cs(className, styles.calendarInput)}
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
            <div
                className={styles.date}
                ref={containerRef}
                onClick={handleCalendarShow}
                onKeyDown={handleCalendarShow}
                tabIndex={-1}
                role="button"
            >
                {nepaliMitiText || '0000-00-00'}
            </div>
            <Button
                onClick={handleClear}
                disabled={disabled || readOnly || !value}
            >
                Clear
            </Button>
            {calendarShown && (
                <FloatingContainer
                    onBlur={handleCalendarHide}
                    onInvalidate={handleOptionsInvalidate}
                    parentRef={containerRef}
                >
                    <Calendar
                        disabled={disabled}
                        readOnly={readOnly}
                        value={value}
                        onChange={handleChange}
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

CalendarInput.defaultProps = {
    disabled: false,
    readOnly: false,
    showHintAndError: true,
    showLabel: true,
};

export default CalendarInput;
