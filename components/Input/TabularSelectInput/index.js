import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import {
    TransparentButton,
} from '../../Action';
import {
    SelectInput,
} from '../../Input';

import {
    Table,
} from '../../View';

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
    options: [],
    blackList: [],
};

@CSSModules(styles, { allowMultiple: true })
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

        const tableHeadersWithRemove = [...tableHeaders];

        tableHeadersWithRemove.push({
            key: 'delete-action-included',
            label: 'Remove',
            modifier: row => (
                <TransparentButton
                    className="delete-button"
                    onClick={() => this.handleRemoveButtonClick(row)}
                >
                    <span className="ion-close" />
                </TransparentButton>
            ),
        });

        const validOptions = options.filter(option => (
            blackList.findIndex(d => (d === keySelector(option))) === -1
        ));

        this.state = {
            validOptions,
            tableHeadersWithRemove,
            selectedOptions: [],
            selectedOptionsKeys: [],
        };
    }

    componentWillReceiveProps(nextProps) {
        const {
            options,
            blackList,
            keySelector,
            tableHeaders,
        } = nextProps;

        const tableHeadersWithRemove = [...tableHeaders];

        tableHeadersWithRemove.push({
            key: 'delete-action-included',
            label: 'Remove',
            modifier: row => (
                <TransparentButton
                    className="delete-button"
                    onClick={() => this.handleRemoveButtonClick(row)}
                >
                    <span className="ion-close" />
                </TransparentButton>
            ),
        });

        if (nextProps !== this.props) {
            const validOptions = options.filter(option => (
                blackList.findIndex(d => (d === keySelector(option))) === -1
            ));

            this.setState({
                tableHeadersWithRemove,
                validOptions,
            });
        }
    }

    handleSelectInputChange = (values) => {
        const {
            options,
            keySelector,
            onChange,
        } = this.props;

        const selectedOptions = options.filter(option => (
            values.findIndex(d => (d === keySelector(option))) !== -1
        ));
        const selectedOptionsKeys = selectedOptions.map(d => keySelector(d));

        this.setState({
            selectedOptions,
            selectedOptionsKeys,
        });

        if (onChange) {
            onChange(selectedOptionsKeys);
        }
    }

    handleRemoveButtonClick = (row) => {
        const {
            keySelector,
            onChange,
        } = this.props;
        const { selectedOptions } = this.state;

        const removedElementKey = keySelector(row);
        const index = selectedOptions.findIndex(
            d => keySelector(d) === removedElementKey);

        const selectedOptionsNew = [...selectedOptions];
        selectedOptionsNew.splice(index, 1);
        const selectedOptionsKeys = selectedOptionsNew.map(d => keySelector(d));

        this.setState({
            selectedOptions: selectedOptionsNew,
            selectedOptionsKeys,
        });

        if (onChange) {
            onChange(selectedOptionsKeys);
        }
    }

    render() {
        const {
            keySelector,
            labelSelector,
            className,
        } = this.props;

        const {
            selectedOptions,
            selectedOptionsKeys,
            validOptions,
            tableHeadersWithRemove,
        } = this.state;

        return (
            <div
                className={`${className} tabular-select-input`}
                styleName="tabular-select-input"
            >
                <SelectInput
                    value={selectedOptionsKeys}
                    options={validOptions}
                    keySelector={keySelector}
                    labelSelector={labelSelector}
                    onChange={this.handleSelectInputChange}
                    multiple
                />
                <Table
                    data={selectedOptions}
                    headers={tableHeadersWithRemove}
                    keyExtractor={keySelector}
                />
            </div>
        );
    }
}
