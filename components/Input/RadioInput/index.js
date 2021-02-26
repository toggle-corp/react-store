import PropTypes from 'prop-types';
import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { FaramInputElement } from '@togglecorp/faram';
import memoize from 'memoize-one';

import ListView from '../../View/List/ListView';
import HintAndError from '../HintAndError';

import Option from './Option';
import styles from './styles.scss';

const propTypes = {
    /**
     * required for style override
     */
    className: PropTypes.string,

    /**
     * unique name for the radio input
     */
    // name: PropTypes.string.isRequired,

    /**
     * Is input disabled?
     */
    // disabled: PropTypes.bool,

    /**
     * list of options
     */
    // eslint-disable-next-line react/forbid-prop-types
    options: PropTypes.array,

    onChange: PropTypes.func,

    keySelector: PropTypes.func,
    labelSelector: PropTypes.func,

    // readOnly: PropTypes.bool,

    /**
     * key for selected option
     */
    persistentHintAndError: PropTypes.bool,
    showHintAndError: PropTypes.bool,
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),
    hint: PropTypes.string,
    error: PropTypes.string,
    changeDelay: PropTypes.number,
};

const defaultProps = {
    className: '',
    onChange: undefined,
    value: undefined,

    keySelector: item => item.key,
    labelSelector: item => item.label,

    options: [],
    // disabled: false,
    // readOnly: false,
    persistentHintAndError: true,
    showHintAndError: true,
    hint: '',
    error: '',
    changeDelay: undefined,
};

export class NormalRadioInput extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    // XXX: use isTruthy
    getSelectedOption = memoize((options, value, keySelector) => (
        options && options.find(d => keySelector(d) === value)
    ))

    handleOptionClick = (key) => {
        const {
            options,
            onChange,
        } = this.props;

        if (!options) {
            return;
        }
        if (onChange) {
            onChange(key);
        }
    }

    rendererParams = (key, option) => {
        const {
            className, // eslint-disable-line @typescript-eslint/no-unused-vars, no-unused-vars
            onChange, // eslint-disable-line @typescript-eslint/no-unused-vars, no-unused-vars
            hint, // eslint-disable-line @typescript-eslint/no-unused-vars, no-unused-vars
            error, // eslint-disable-line @typescript-eslint/no-unused-vars, no-unused-vars
            changeDelay, // eslint-disable-line @typescript-eslint/no-unused-vars, no-unused-vars
            // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
            showHintAndError,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
            persistentHintAndError,
            labelSelector,
            keySelector,
            options,
            value,
            ...otherProps
        } = this.props;

        const selectedOption = this.getSelectedOption(options, value, keySelector);

        return {
            ...otherProps,
            optionKey: key,
            checked: selectedOption && key === keySelector(selectedOption),
            onClick: this.handleOptionClick,
            label: labelSelector(option),
        };
    }

    render() {
        const {
            className,
            options,
            keySelector,
            persistentHintAndError,
            showHintAndError,
            hint,
            error,
        } = this.props;

        return (
            <>
                <ListView
                    className={_cs('radio-input', className, styles.radioInput)}
                    data={options}
                    keySelector={keySelector}
                    renderer={Option}
                    rendererParams={this.rendererParams}
                />
                <HintAndError
                    show={showHintAndError}
                    hint={hint}
                    error={error}
                    persistent={persistentHintAndError}
                />
            </>
        );
    }
}

export default FaramInputElement(NormalRadioInput);
