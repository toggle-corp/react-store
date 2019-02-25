import PropTypes from 'prop-types';
import React from 'react';
import {
    isDefined,
    _cs,
} from '@togglecorp/fujs';
import { FaramInputElement } from '@togglecorp/faram';

import ListView from '../../View/List/ListView';
import { iconNames } from '../../../constants';
import Checkbox from '../Checkbox';

import Label from '../Label';
import HintAndError from '../HintAndError';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    value: PropTypes.arrayOf(PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
    ])),
    options: PropTypes.arrayOf(PropTypes.object),
    onChange: PropTypes.func.isRequired,
    keySelector: PropTypes.func,
    labelSelector: PropTypes.func,
    tooltipSelector: PropTypes.func,

    label: PropTypes.string,
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
    error: PropTypes.string,
    hint: PropTypes.string,
    showLabel: PropTypes.bool,
    showHintAndError: PropTypes.bool,
    segment: PropTypes.bool,
};

const defaultProps = {
    className: '',
    value: [],
    options: [],
    onChange: undefined,
    keySelector: item => item.key,
    tooltipSelector: item => item.label,
    labelSelector: item => item.label,

    label: '',
    disabled: false,
    readOnly: false,
    error: '',
    hint: '',
    showLabel: true,
    showHintAndError: true,
    segment: false,
};


export class NormalListSelection extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getClassName = () => {
        const {
            className: classNameFromProps,
            disabled,
            error,
            segment,
        } = this.props;

        const className = _cs(
            classNameFromProps,
            styles.listSelection,
            'list-selection',
            segment ? styles.multiSegment : styles.singleSegment,
            segment ? 'multi-segment' : 'single-segment',
            disabled && styles.disabled,
            disabled && 'disabled',
            error && styles.error,
            error && 'error',
        );

        return className;
    }

    handleItemChange = (key, isSelected) => {
        const { value, onChange } = this.props;

        const newValue = [...value];
        if (!isSelected) {
            const index = newValue.indexOf(key);
            newValue.splice(index, 1);
        } else {
            newValue.push(key);
        }

        onChange(newValue);
    }

    renderParams = (key, itemData) => {
        const {
            labelSelector,
            tooltipSelector,
            value,
            disabled,
            readOnly,
            segment,
        } = this.props;

        const selected = value.indexOf(key) >= 0;
        /*
        const className = _cs(
            styles.item,
            isDefined(selected) && styles.checked,
        );
        */

        return {
            // className,
            className: styles.item,
            label: labelSelector(itemData),
            tooltip: tooltipSelector(itemData),
            value: selected,
            onChange: val => this.handleItemChange(key, val),
            checkboxType: segment ? iconNames.check : iconNames.checkbox,
            disabled,
            readOnly,
        };
    }

    renderInput = () => {
        const {
            options,
            keySelector,
        } = this.props;

        return (
            <ListView
                className={_cs(styles.options, 'list-selection-options')}
                data={options}
                renderer={Checkbox}
                keySelector={keySelector}
                rendererParams={this.renderParams}
            />
        );
    }

    render() {
        const {
            label,
            hint,
            error,
            showHintAndError,
            showLabel,
            disabled,
        } = this.props;

        const className = this.getClassName();
        const Input = this.renderInput;

        return (
            <div className={className}>
                <Label
                    show={showLabel}
                    text={label}
                    disabled={disabled}
                    error={!!error}
                />
                <Input />
                <HintAndError
                    show={showHintAndError}
                    hint={hint}
                    error={error}
                />
            </div>
        );
    }
}

export default FaramInputElement(NormalListSelection);
