import PropTypes from 'prop-types';
import React from 'react';

import ListView from '../../View/List/ListView';
import { iconNames } from '../../../constants';
import { FaramInputElement } from '../../General/FaramElements';
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
            className,
            disabled,
            error,
            segment,
        } = this.props;

        const classNames = [
            className,
            styles.listSelection,
            'list-selection',
        ];

        if (segment) {
            classNames.push(styles.multiSegment);
            classNames.push('multi-segment');
        } else {
            classNames.push(styles.listSelection);
            classNames.push('list-selection');
        }

        if (disabled) {
            classNames.push(styles.disabled);
            classNames.push('disabled');
        }

        if (error) {
            classNames.push(styles.error);
            classNames.push('error');
        }

        return classNames.join(' ');
    }

    handleItemChange = (key, selected) => {
        const { value, onChange } = this.props;
        const newValue = [...value];

        if (!selected) {
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
            value,
            disabled,
            readOnly,
            segment,
        } = this.props;

        const selected = value.indexOf(key) >= 0;
        const classNames = [styles.item];
        if (selected) {
            classNames.push(styles.checked);
        }

        return {
            className: classNames.join(' '),
            label: labelSelector(itemData),
            value: selected,
            onChange: val => this.handleItemChange(key, val),
            checkboxType: segment ? iconNames.check : iconNames.checkbox,
            disabled,
            readOnly,
        };
    }

    renderInput = () => {
        const { options, keySelector } = this.props;

        return (
            <ListView
                className={styles.options}
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
        } = this.props;

        const className = this.getClassName();
        const Input = this.renderInput;

        return (
            <div className={className}>
                <Label
                    className={styles.label}
                    show={showLabel}
                    text={label}
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
