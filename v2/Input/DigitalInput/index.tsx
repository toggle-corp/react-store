import React from 'react';
import {
    padStart,
    isFalsyString,
    isTruthyString,
    _cs,
} from '@togglecorp/fujs';

import RawInput from '../RawInput';

import styles from './styles.scss';


interface Props extends Omit<React.HTMLProps<HTMLInputElement>, 'ref' | 'onChange'>{
    value: string;
    className?: string;
    onChange: (value: string) => void;
    padLength: number;
}

// NOTE: doesn't support zero
const DigitalInput = (props: Props) => {
    const {
        value,
        className: classNameFromProps,
        padLength,
        onChange,
        ...otherProps
    } = props;

    const handleChange = (event: React.FormEvent<HTMLInputElement>) => {
        if (!onChange) {
            return;
        }
        const {
            currentTarget: {
                value: newValue,
            },
        } = event;

        if (newValue.length <= padLength) {
            onChange(newValue);
            return;
        }

        const sanitizedValue = newValue.substr(newValue.length - padLength);
        onChange(sanitizedValue);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (!onChange) {
            return;
        }
        const {
            key,
            currentTarget: {
                value: oldValue,
            },
        } = event;
        if (key === 'Backspace' && isTruthyString(oldValue) && /^0+$/.test(oldValue.slice(0, -1))) {
            onChange('');
            event.preventDefault();
        }
    };

    const className = _cs(
        classNameFromProps,
        'digital-input',
        styles.digitalInput,
    );

    return (
        <RawInput
            className={className}
            type="number"
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            value={(
                isTruthyString(value)
                    ? padStart(value, padLength)
                    : value
            )}
            {...otherProps}
        />
    );
};
DigitalInput.defaultProps = {
    value: '',
    onChange: undefined,
    padLength: 2,
};

export default DigitalInput;
