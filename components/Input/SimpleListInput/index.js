import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';
import {
    _cs,
    listToMap,
} from '@togglecorp/fujs';
import { FaramInputElement } from '@togglecorp/faram';

import ListView from '../../View/List/ListView';
import RemovableListItem from '../RemovableListItem';

import HintAndError from '../HintAndError';
import Label from '../Label';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
    error: PropTypes.string,
    hint: PropTypes.string,
    itemClassName: PropTypes.string,
    keySelector: PropTypes.func,
    label: PropTypes.string,
    labelSelector: PropTypes.func,
    onChange: PropTypes.func.isRequired,
    options: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    showHintAndError: PropTypes.bool,
    showLabel: PropTypes.bool,
    value: PropTypes.array, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: undefined,
    disabled: false,
    readOnly: false,
    error: '',
    hint: '',
    itemClassName: undefined,
    keySelector: d => (d || {}).key,
    label: '',
    labelSelector: d => (d || {}).label,
    options: [],
    showHintAndError: true,
    showLabel: true,
    value: [],
};

const itemKeySelector = d => d;

class SimpleListInput extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    getOptionsMap = memoize((options, keySelector) => (
        listToMap(
            options,
            keySelector,
            d => d,
        )
    ))

    getRendererParams = (key) => {
        const {
            options,
            labelSelector,
            keySelector,
            itemClassName,
            disabled,
            readOnly,
        } = this.props;

        const optionsMap = this.getOptionsMap(options, keySelector);

        return ({
            itemKey: key,
            value: labelSelector(optionsMap[key]),
            onRemoveButtonClick: this.handleItemRemoveButtonClick,
            className: itemClassName,
            disabled,
            readOnly,
        });
    }

    handleItemRemoveButtonClick = (itemKey) => {
        const {
            value,
            onChange,
        } = this.props;

        const itemIndex = value.findIndex(d => d === itemKey);
        const newValue = [...value];
        newValue.splice(itemIndex, 1);

        onChange(newValue);
    }

    render() {
        const {
            className,
            disabled,
            error,
            hint,
            label,
            showHintAndError,
            showLabel,
            value,
        } = this.props;

        return (
            <div
                className={_cs(
                    className,
                    styles.listInput,
                )}
            >
                <Label
                    className={styles.label}
                    show={showLabel}
                    text={label}
                    error={!!error}
                    disabled={disabled}
                />
                <ListView
                    className={styles.list}
                    data={value}
                    renderer={RemovableListItem}
                    rendererParams={this.getRendererParams}
                    keySelector={itemKeySelector}
                />
                <HintAndError
                    className={styles.hintAndError}
                    show={showHintAndError}
                    hint={hint}
                    error={error}
                />
            </div>
        );
    }
}

export default FaramInputElement(SimpleListInput);
