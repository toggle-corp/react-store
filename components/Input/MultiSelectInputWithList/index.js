import PropTypes from 'prop-types';
import React from 'react';
import { _cs, listToMap } from '@togglecorp/fujs';
import { FaramInputElement } from '@togglecorp/faram';
import memoize from 'memoize-one';

import MultiSelectInput from '../MultiSelectInput';
import SearchMultiSelectInput from '../SearchMultiSelectInput';
import DismissableListItem from '../../Action/DismissableListItem';
import ListItem from '../../View/ListItem';
import ListView from '../../View/List/ListView';

import styles from './styles.scss';

const propTypes = {
    keySelector: PropTypes.func,
    labelSelector: PropTypes.func,
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
    onChange: PropTypes.func,

    label: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),

    value: PropTypes.arrayOf(PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ])),

    hideRemoveFromListButton: PropTypes.bool,

    className: PropTypes.string,
    listClassName: PropTypes.string,
    selectClassName: PropTypes.string,

    // eslint-disable-next-line react/forbid-prop-types
    listProps: PropTypes.object,

    options: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.number,
            ]),
            label: PropTypes.string,
        }),
    ),
    topRightChild: PropTypes.node,

    emptyComponent: PropTypes.func,
    maxDisplayOptions: PropTypes.number,

    hideList: PropTypes.bool,
    hideInput: PropTypes.bool,
};

const defaultProps = {
    className: '',
    listClassName: '',
    selectClassName: '',
    listProps: {},
    keySelector: (d = {}) => d.key,
    labelSelector: (d = {}) => d.label,
    onChange: undefined,
    options: [],
    value: [],
    label: '',
    hideRemoveFromListButton: false,
    topRightChild: undefined,
    disabled: false,
    readOnly: false,
    emptyComponent: undefined,
    maxDisplayOptions: undefined,

    hideList: false,
    hideInput: false,
};

class MultiSelectInputWithList extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    getObjectFromValue = memoize((options, value, keySelector) => {
        const valueMapping = listToMap(
            value,
            v => v,
            () => true,
        );
        return options.filter(d => !!valueMapping[keySelector(d)]);
    })

    getListItemParams = (key, datum) => {
        const {
            labelSelector,
        } = this.props;

        return {
            value: labelSelector(datum),
            itemKey: key,
            onDismiss: this.handleItemDismiss,
            className: styles.listItem,
        };
    }

    handleItemDismiss = (key) => {
        const {
            onChange,
            value,
        } = this.props;

        const index = value.indexOf(key);
        const newValue = [...value];

        if (index !== -1) {
            newValue.splice(index, 1);
        }
        if (onChange) {
            onChange(newValue);
        }
    }

    handleSelectInputChange = (values) => {
        const { onChange } = this.props;

        if (onChange) {
            onChange(values);
        }
    }

    render() {
        const {
            className: classNameFromProps,
            onChange, // eslint-disable-line no-unused-vars, @typescript-eslint/no-unused-vars
            disabled,
            keySelector,
            label,
            labelSelector,
            readOnly,
            options,
            value,
            selectClassName: selectClassNameFromProps,
            listProps,
            emptyComponent,
            listClassName: listClassNameFromProps,
            topRightChild,
            hideRemoveFromListButton,
            hideList,
            hideInput,
            maxDisplayOptions,

            ...otherProps
        } = this.props;


        const className = _cs(
            classNameFromProps,
            styles.selectInputWithList,
            'select-input-with-list',
            disabled && styles.disabled,
        );

        const listClassName = _cs(
            listClassNameFromProps,
            styles.list,
            'list',
        );

        const selectClassName = _cs(
            selectClassNameFromProps,
            styles.input,
            'select',
        );

        const Item = (hideRemoveFromListButton || readOnly || disabled)
            ? ListItem
            : DismissableListItem;

        const Input = (maxDisplayOptions === undefined)
            ? MultiSelectInput
            : SearchMultiSelectInput;

        return (
            <div className={className}>
                <div className={styles.headerContainer}>
                    {!hideInput && (
                        <Input
                            className={selectClassName}
                            disabled={disabled}
                            readOnly={readOnly}
                            keySelector={keySelector}
                            label={label}
                            labelSelector={labelSelector}
                            onChange={this.handleSelectInputChange}
                            options={options}
                            value={value}
                            maxDisplayOptions={maxDisplayOptions}
                            {...otherProps}
                        />
                    )}
                    {topRightChild}
                </div>
                {!hideList && (
                    <ListView
                        className={listClassName}
                        data={this.getObjectFromValue(options, value, keySelector)}
                        renderer={Item}
                        rendererParams={this.getListItemParams}
                        keySelector={keySelector}
                        emptyComponent={emptyComponent}
                        {...listProps}
                    />
                )}
            </div>
        );
    }
}

export default FaramInputElement(MultiSelectInputWithList);
