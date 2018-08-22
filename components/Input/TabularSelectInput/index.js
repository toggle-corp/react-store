import PropTypes from 'prop-types';
import React from 'react';

import { listToMap } from '../../../utils/common';
import { iconNames } from '../../../constants';
import { FaramInputElement } from '../../General/FaramElements';

import DangerButton from '../../Action/Button/DangerButton';
import MultiSelectInput from '../../Input/MultiSelectInput';
import Table from '../../View/Table';

import styles from './styles.scss';

/**
 * comparator: comparator function for sorting, recieves data rows(not column data)
 *
 * defaultSortOrder: the sort order which should be applied when clicked,
 *
 * key: unique key for each column, the key is also used to determine
 *      the data for rows in the body
 *
 * label: text label for the column
 *
 * modifier: returns a renderable object for the column, recieves whole row of data (not column)
 *
 * order: the order in which they appear relative to that of other header columns
 *
 * sortable: is element sortable?
 */
const TableHeaderPropTypes = PropTypes.arrayOf(
    PropTypes.shape({
        comparator: PropTypes.func,
        defaultSortOrder: PropTypes.string,
        key: PropTypes.string,
        label: PropTypes.string,
        modifier: PropTypes.func,
        order: PropTypes.number,
        sortable: PropTypes.bool,
    }),
);

const propTypes = {
    blackList: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.arrayOf(
            PropTypes.string,
        ),
        PropTypes.arrayOf(
            PropTypes.number,
        ),
    ]),

    /**
     * Key selector function
     * should return key from provided row data
     */
    keySelector: PropTypes.func,

    onChange: PropTypes.func,

    value: PropTypes.arrayOf(
        PropTypes.object,
    ),

    /**
     * String to show in case of error
     */
    error: PropTypes.string,

    /**
     * Hint text
     */
    hint: PropTypes.string,

    showHintAndError: PropTypes.bool,

    disabled: PropTypes.bool,

    /**
     * Value selector function
     * should return value from provided row data
     */
    labelSelector: PropTypes.func,

    hideRemoveFromListButton: PropTypes.bool,

    className: PropTypes.string,
    /**
     * Options to be shown
     */
    options: PropTypes.arrayOf(
        PropTypes.object,
    ),

    /**
     * headers is an array of the structure objects required for the header
     *
     * NOTE: see { TableHeaderPropTypes } in Table/Header for more detail
     */
    tableHeaders: TableHeaderPropTypes.isRequired,
};

const defaultProps = {
    className: '',
    keySelector: d => (d || {}).key,
    labelSelector: d => (d || {}).label,
    onChange: undefined,
    hideRemoveFromListButton: false,
    error: '',
    hint: '',
    options: [],
    blackList: [],
    value: [],
    disabled: false,
    showHintAndError: true,
};

class TabularSelectInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const {
            options,
            blackList,
            keySelector,
            tableHeaders,
            value,
        } = this.props;

        const selectedOptions = this.getSelectedOptions(value, keySelector, blackList);
        const tableHeadersWithRemove = this.createTableHeaders(tableHeaders);
        const validOptions = this.getValidOptions(options, keySelector, blackList);
        const selectedOptionsKeys = selectedOptions.map(d => keySelector(d));

        this.state = {
            validOptions,
            tableHeadersWithRemove,
            selectedOptions,
            selectedOptionsKeys,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.tableHeaders !== this.props.tableHeaders) {
            const { tableHeaders } = nextProps;
            const tableHeadersWithRemove = this.createTableHeaders(tableHeaders);
            this.setState({ tableHeadersWithRemove });
        }

        if (
            nextProps.blackList !== this.props.blackList ||
            nextProps.options !== this.props.options
        ) {
            const validOptions = this.getValidOptions(
                nextProps.options,
                nextProps.keySelector,
                nextProps.blackList,
            );
            this.setState({
                validOptions,
            });
        }

        if (nextProps.value !== this.props.value) {
            const selectedOptions = this.getSelectedOptions(
                nextProps.value,
                nextProps.keySelector,
                this.props.blackList,
            );
            const selectedOptionsKeys = selectedOptions.map(d => nextProps.keySelector(d));

            this.setState({
                selectedOptions,
                selectedOptionsKeys,
            });
        }
    }

    getClassName = () => {
        const { className } = this.props;
        const { error } = this.state;

        const classNames = [
            className,
            styles.tabularSelectInput,
            'tabular-select-input',
        ];

        if (error) {
            classNames.push(styles.error);
            classNames.push('error');
        }

        return classNames.join(' ');
    }

    getSelectedOptions = (values, keySelector, blackList) => {
        const blackListMap = listToMap(
            blackList,
            d => d,
            () => true,
        );

        const selectedOptions = values.filter(
            value => !blackListMap[keySelector(value)],
        );
        return selectedOptions;
    }

    getValidOptions = (options, keySelector, blackList) => {
        const blackListMap = listToMap(
            blackList,
            d => d,
            () => true,
        );

        const validOptions = options.filter(
            option => !blackListMap[keySelector(option)],
        );
        return validOptions;
    }

    createTableHeaders = (tableHeaders) => {
        const { hideRemoveFromListButton } = this.props;
        if (hideRemoveFromListButton) {
            return tableHeaders;
        }

        return ([
            ...tableHeaders,
            {
                key: 'delete-action-included',
                label: 'Remove',
                modifier: row => (
                    <DangerButton
                        className="delete-button"
                        onClick={() => this.handleRemoveButtonClick(row)}
                        iconName={iconNames.delete}
                        smallVerticalPadding
                        transparent
                    />
                ),
            },
        ]);
    }

    handleSelectInputChange = (values) => {
        const {
            keySelector,
            onChange,
        } = this.props;
        const {
            validOptions,
        } = this.state;

        const selectedOptions = [];
        values.forEach((v) => {
            const rowIndex = validOptions.findIndex(u => keySelector(u) === v);
            if (rowIndex !== -1) {
                selectedOptions.push(validOptions[rowIndex]);
            }
        });
        const selectedOptionsKeys = selectedOptions.map(d => keySelector(d));

        this.setState(
            {
                selectedOptions,
                selectedOptionsKeys,
            },
            () => {
                if (onChange) {
                    onChange(selectedOptions);
                }
            },
        );
    }

    handleRemoveButtonClick = (row) => {
        const {
            keySelector,
            onChange,
        } = this.props;
        const { selectedOptions } = this.state;

        // Remove from selectedOptions
        const removedElementKey = keySelector(row);
        const index = selectedOptions.findIndex(
            d => keySelector(d) === removedElementKey,
        );
        const selectedOptionsNew = [...selectedOptions];
        selectedOptionsNew.splice(index, 1);

        const selectedOptionsKeys = selectedOptionsNew.map(d => keySelector(d));

        this.setState(
            {
                selectedOptions: selectedOptionsNew,
                selectedOptionsKeys,
            },
            () => {
                if (onChange) {
                    onChange(selectedOptionsNew);
                }
            },
        );
    }

    render() {
        const {
            keySelector,
            labelSelector,
            error,
            hint,
            showHintAndError,
            disabled,
            onChange, // eslint-disable-line no-unused-vars
            value, // eslint-disable-line no-unused-vars
            options, // eslint-disable-line no-unused-vars
            className, // eslint-disable-line no-unused-vars
            ...otherProps
        } = this.props;

        const {
            selectedOptions,
            selectedOptionsKeys,
            validOptions,
            tableHeadersWithRemove,
        } = this.state;

        return (
            <div className={this.getClassName()} >
                <MultiSelectInput
                    className={styles.select}
                    value={selectedOptionsKeys}
                    options={validOptions}
                    keySelector={keySelector}
                    labelSelector={labelSelector}
                    onChange={this.handleSelectInputChange}
                    disabled={disabled}
                    error={error}
                    showHintAndError={false}
                    {...otherProps}
                />
                <div className={styles.tableContainer}>
                    <Table
                        data={selectedOptions}
                        headers={tableHeadersWithRemove}
                        keyExtractor={keySelector}
                    />
                </div>
                {
                    showHintAndError && [
                        !error && hint && (
                            <p
                                key="hint"
                                className={`${styles.hint} hint`}
                            >
                                {hint}
                            </p>
                        ),
                        error && !hint && (
                            <p
                                key="error"
                                className={`${styles.error} error`}
                            >
                                {error}
                            </p>
                        ),
                        !error && !hint && (
                            <p
                                key="empty"
                                className={`${styles.empty} empty`}
                            >
                                -
                            </p>
                        ),
                    ]
                }
            </div>
        );
    }
}

export default FaramInputElement(TabularSelectInput);
