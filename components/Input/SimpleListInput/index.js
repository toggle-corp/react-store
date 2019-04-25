import PropTypes from 'prop-types';
import React from 'react';
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
    error: PropTypes.string,
    hint: PropTypes.string,
    label: PropTypes.string,
    showLabel: PropTypes.bool,
    showHintAndError: PropTypes.bool,
    value: PropTypes.array,
    keySelector: PropTypes.func,
    labelSelector: PropTypes.func,
};

const defaultProps = {
    className: undefined,
    disabled: false,
    error: '',
    hint: '',
    label: '',
    showLabel: true,
    showHintAndError: true,
    value: '',
    keySelector: d => (d || {}).key,
    labelSelector: d => (d || {}).label,
};

const itemKeySelector = d => d;

class DroppableListInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getOptionsMap = (options, keySelector) => (
        listToMap(
            options,
            keySelector,
            d => d,
        )
    )

    getRendererParams = (key, data) => {
        const {
            options,
            labelSelector,
            keySelector,
            itemClassName,
        } = this.props;

        const optionsMap = this.getOptionsMap(options, keySelector);

        return ({
            itemKey: key,
            value: labelSelector(optionsMap[key]),
            onRemoveButtonClick: this.handleItemRemoveButtonClick,
            className: itemClassName,
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
            options,
            value,
            keySelector,
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

export default FaramInputElement(DroppableListInput);
