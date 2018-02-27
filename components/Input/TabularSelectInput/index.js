import PropTypes from 'prop-types';
import React from 'react';

import { listToMap } from '../../../utils/common';
import { iconNames } from '../../../constants';

import DangerButton from '../../Action/Button/DangerButton';
import MultiSelectInput from '../../Input/SelectInput/MultiSelectInput';
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

    /**
     * Value selector function
     * should return value from provided row data
     */
    labelSelector: PropTypes.func,

    className: PropTypes.string,
    /**
     * Options to be shown
     */
    options: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.number,
            ]),
            label: PropTypes.string,
        }),
    ),

    optionsIdentifier: PropTypes.string,
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
    optionsIdentifier: undefined,
    options: [],
    blackList: [],
};

export default class TabularSelectInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const {
            options,
            blackList,
            keySelector,
            tableHeaders,
        } = this.props;

        const tableHeadersWithRemove = this.createTableHeaders(tableHeaders);
        const validOptions = this.getValidOptions(options, keySelector, blackList);

        this.state = {
            validOptions,
            tableHeadersWithRemove,
            selectedOptions: [],
            selectedOptionsKeys: [],
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
            const selectedOptions = this.getSelectedOptions(
                validOptions,
                this.props.keySelector,
                this.state.selectedOptionsKeys,
            );
            this.setState({
                validOptions,
                selectedOptions,
            });
        }
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

    getSelectedOptions = (options, keySelector, values) => {
        const valuesMap = listToMap(
            values,
            d => d,
            () => true,
        );

        const selectedOptions = options.filter(
            option => valuesMap[keySelector(option)],
        );
        return selectedOptions;
    }

    createTableHeaders = tableHeaders => ([
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
    ])

    handleSelectInputChange = (values) => {
        const {
            options,
            keySelector,
            onChange,
        } = this.props;

        const selectedOptions = this.getSelectedOptions(
            options,
            keySelector,
            values,
        );
        const selectedOptionsKeys = selectedOptions.map(d => keySelector(d));

        this.setState(
            {
                selectedOptions,
                selectedOptionsKeys,
            },
            () => {
                if (onChange) {
                    onChange(selectedOptionsKeys);
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
                    onChange(selectedOptionsKeys);
                }
            },
        );
    }

    render() {
        const {
            keySelector,
            labelSelector,
            className,
            optionsIdentifier,
        } = this.props;

        const {
            selectedOptions,
            selectedOptionsKeys,
            validOptions,
            tableHeadersWithRemove,
        } = this.state;

        return (
            <div className={`${className} tabular-select-input ${styles['tabular-select-input']}`} >
                <MultiSelectInput
                    className={styles.select}
                    value={selectedOptionsKeys}
                    options={validOptions}
                    keySelector={keySelector}
                    labelSelector={labelSelector}
                    optionsIdentifier={optionsIdentifier}
                    onChange={this.handleSelectInputChange}
                />
                <div className={styles['table-container']}>
                    <Table
                        data={selectedOptions}
                        headers={tableHeadersWithRemove}
                        keyExtractor={keySelector}
                    />
                </div>
            </div>
        );
    }
}
