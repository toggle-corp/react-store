import React from 'react';
import PropTypes from 'prop-types';
import { isFalsy } from '@togglecorp/fujs';

import { FaramInputElement } from '../../General/FaramElements';
import ListView from '../../View/List/ListView';
import HintAndError from '../HintAndError';
import Label from '../Label';

import Option from './Option';
import styles from './styles.scss';

const propTypes = {
    /**
     * required for style override
     */
    className: PropTypes.string,

    /**
     * Is input disabled?
     */
    disabled: PropTypes.bool,

    /**
     * String to show in case of error
     */
    error: PropTypes.string,

    /**
     * Hint text
     */
    hint: PropTypes.string,

    /**
     * Input label
     */
    label: PropTypes.string,

    /**
     * A callback for when the input changes its content
     */
    onChange: PropTypes.func,
    required: PropTypes.bool,

    showLabel: PropTypes.bool,

    showHintAndError: PropTypes.bool,

    options: PropTypes.arrayOf(PropTypes.object),

    labelSelector: PropTypes.func,
    keySelector: PropTypes.func,
    readOnly: PropTypes.bool,

    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.bool,
    ]),

    name: PropTypes.string,
};

const defaultProps = {
    className: '',
    disabled: false,
    readOnly: false,
    error: '',
    hint: '',
    label: '',
    onChange: undefined,
    required: false,
    showLabel: true,
    keySelector: d => d.key,
    labelSelector: d => d.label,
    showHintAndError: true,
    value: '',
    name: '',
    options: [],
};

class SegmentInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getClassName = () => {
        const {
            className,
            disabled,
            error,
            required,
        } = this.props;

        const classNames = [
            className,
            'segment-input',
            styles.segmentInput,
        ];

        if (disabled) {
            classNames.push('disabled');
            classNames.push(styles.disabled);
        }
        if (!isFalsy(error, [''])) {
            classNames.push('error');
            classNames.push(styles.error);
        }
        if (required) {
            classNames.push('required');
            classNames.push(styles.required);
        }
        return classNames.join(' ');
    }

    handleInputChange = (changeEvent) => {
        const {
            onChange,
            disabled,
            options,
            keySelector,
            readOnly,
        } = this.props;
        const { value } = changeEvent.target;

        const finalValue = options
            .map(val => keySelector(val))
            .find(val => String(val) === value);

        if (onChange && !disabled && !readOnly) {
            onChange(finalValue);
        }
    }

    rendererParams = (key, data) => ({
        label: this.props.labelSelector(data),
        id: String(this.props.keySelector(data)),
        onChange: this.handleInputChange,
        name: this.props.name,
        checked: String(this.props.value) === String(key),
        error: this.props.error,
        readOnly: this.props.readOnly,
        disabled: this.props.disabled,
    });

    render() {
        const {
            error,
            hint,
            label,
            showLabel,
            showHintAndError,
            options,
            keySelector,
        } = this.props;

        const classNames = this.getClassName();

        return (
            <div className={classNames}>
                <Label
                    className={styles.label}
                    show={showLabel}
                    text={label}
                />
                <ListView
                    className={styles.segmentContainer}
                    data={options}
                    renderer={Option}
                    rendererParams={this.rendererParams}
                    keySelector={keySelector}
                />
                <HintAndError
                    show={showHintAndError}
                    hint={hint}
                    error={error}
                />
            </div>
        );
    }
}

export default FaramInputElement(SegmentInput);
