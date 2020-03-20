import React, { useMemo, useCallback, useRef, useState } from 'react';
import {
    BS,
    AD,
    Miti,
    Ymd,
    _cs,
    isTruthyString,
} from '@togglecorp/fujs';

import DigitalInput from '../../DigitalInput';

import styles from './styles.scss';

interface Props {
    className?: string;
    value?: Miti;
    disabled: boolean;
    readOnly: boolean;
    onChange: (value: string | undefined) => void;
}

const Input = (props: Props) => {
    const {
        className,
        disabled,
        value: valueMiti,
        readOnly,
        onChange,
    } = props;

    const timeoutRef = useRef<number>();

    const [
        tempYmd,
        setTempYmd,
    ] = useState<{ y?: string; m?: string; d?: string } | undefined>(undefined);

    let yearValue: string | undefined;
    if (tempYmd) {
        yearValue = tempYmd.y;
    } else if (valueMiti) {
        yearValue = String(valueMiti.getYear());
    }

    let monthValue: string | undefined;
    if (tempYmd) {
        monthValue = tempYmd.m;
    } else if (valueMiti) {
        monthValue = String(valueMiti.getMonth());
    }

    let dayValue: string | undefined;
    if (tempYmd) {
        dayValue = tempYmd.d;
    } else if (valueMiti) {
        dayValue = String(valueMiti.getDay());
    }

    const finalYmd = useMemo(
        () => {
            if (
                tempYmd
                && isTruthyString(tempYmd.y)
                && isTruthyString(tempYmd.m)
                && isTruthyString(tempYmd.d)
            ) {
                return new Ymd(+tempYmd.y, +tempYmd.m, +tempYmd.d);
            }
            return undefined;
        },
        [tempYmd],
    );

    const finalYmdIsValid = useMemo(
        () => {
            if (!tempYmd) {
                return true;
            }
            if (!finalYmd) {
                return false;
            }
            return BS.isValidDate(finalYmd)[0];
        },
        [tempYmd, finalYmd],
    );

    const handleFocus = useCallback(
        () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = undefined;
            }
            // console.warn('Focus in div');
        },
        [],
    );

    const handleBlur = useCallback(
        () => {
            const handleChange = () => {
                // console.warn('Focus out of div');

                if (finalYmd && finalYmdIsValid) {
                    const nepaliMiti = new Miti(
                        finalYmd.getYear(),
                        finalYmd.getMonth(),
                        finalYmd.getDay(),
                        BS,
                    );
                    const englishMiti = nepaliMiti.convertTo(AD);

                    onChange(englishMiti.getString());
                }
                setTempYmd(undefined);
            };

            // NOTE: this is a hack so that an immediate handle blur is not
            // called when switching focus between input elements inside this
            // current div
            timeoutRef.current = window.setTimeout(
                handleChange,
                0,
            );
        },
        [onChange, finalYmd, finalYmdIsValid],
    );

    const handleYearChange = useCallback(
        (newYear: string | undefined) => {
            setTempYmd((ymd) => {
                if (!ymd && valueMiti) {
                    return {
                        y: newYear,
                        m: String(valueMiti.getMonth()),
                        d: String(valueMiti.getDay()),
                    };
                }
                return {
                    ...ymd,
                    y: newYear,
                };
            });
        },
        [valueMiti],
    );

    const handleMonthChange = useCallback(
        (newMonth: string | undefined) => {
            setTempYmd((ymd) => {
                if (!ymd && valueMiti) {
                    return {
                        y: String(valueMiti.getYear()),
                        m: newMonth,
                        d: String(valueMiti.getDay()),
                    };
                }
                return {
                    ...ymd,
                    m: newMonth,
                };
            });
        },
        [valueMiti],
    );

    const handleDayChange = useCallback(
        (newDay: string | undefined) => {
            setTempYmd((ymd) => {
                if (!ymd && valueMiti) {
                    return {
                        y: String(valueMiti.getYear()),
                        m: String(valueMiti.getMonth()),
                        d: newDay,
                    };
                }
                return {
                    ...ymd,
                    d: newDay,
                };
            });
        },
        [valueMiti],
    );

    return (
        <div
            className={_cs(
                styles.dateInput,
                className,
                !finalYmdIsValid && styles.invalid,
            )}
            onFocus={handleFocus}
            onBlur={handleBlur}
        >
            <DigitalInput
                className={styles.input}
                value={yearValue}
                min={BS.getMinYmd().getYear()}
                max={BS.getMaxYmd().getYear()}
                padLength={4}
                onChange={handleYearChange}
                placeholder="yyyy"
                disabled={disabled}
                readOnly={readOnly}
            />
            <DigitalInput
                className={styles.input}
                value={monthValue}
                min={1}
                max={12}
                onChange={handleMonthChange}
                placeholder="mm"
                disabled={disabled}
                readOnly={readOnly}
            />
            <DigitalInput
                className={styles.input}
                value={dayValue}
                min={1}
                max={32}
                onChange={handleDayChange}
                placeholder="dd"
                disabled={disabled}
                readOnly={readOnly}
            />
        </div>
    );
};

export default Input;
