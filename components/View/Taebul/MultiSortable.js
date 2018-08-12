import React from 'react';
import PropTypes from 'prop-types';
import hoistNonReactStatics from 'hoist-non-react-statics';
import memoize from 'memoize-one';

import { mapToList } from '../../../utils/common';
import update from '../../../utils/immutable-update';

const propTypes = {
    data: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    columns: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    settings: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    onChange: PropTypes.func, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    data: [],
    columns: [],
    settings: {},
    onChange: () => {},
};

export const ORDER = {
    asc: 'asc',
    dsc: 'dsc',
};

export default (WrappedComponent) => {
    const MultiSortedComponent = class extends React.PureComponent {
        static propTypes = propTypes;
        static defaultProps = defaultProps;

        static sortData = memoize((data, columns = [], sortOrders = {}) => {
            if (Object.keys(sortOrders).length <= 0) {
                return data;
            }

            const sortOrderList = mapToList(sortOrders)
                .sort((foo, bar) => foo.logicalOrder - bar.logicalOrder);
            return [...data].sort((foo, bar) => {
                for (let i = 0; i < sortOrderList.length; i += 1) {
                    const { key, order } = sortOrderList[i];
                    const { comparator } = columns.find(c => c.key === key);
                    if (comparator) {
                        const sortVal = comparator(foo, bar, order === ORDER.dsc ? -1 : 1);
                        if (sortVal !== 0) {
                            return sortVal;
                        }
                    } else {
                        console.warn(`comparator not defined for column ${key}`);
                    }
                }
                return 0;
            });
        })

        static getAction = (columnKey, sortOrders = {}) => {
            const logicalOrderList = mapToList(sortOrders, s => s.logicalOrder);
            const maxOrder = Math.max(...logicalOrderList, 0) + 1;

            const sortOrder = sortOrders[columnKey];
            if (!sortOrder) {
                const newEntry = {
                    key: columnKey,
                    order: ORDER.asc,
                    logicalOrder: maxOrder,
                };
                return {
                    sortOrders: { $auto: {
                        [columnKey]: { $set: newEntry },
                    } },
                };
            }

            const { order } = sortOrder;
            if (order === ORDER.dsc) {
                return {
                    sortOrders: {
                        $unset: [columnKey],
                    },
                };
            }

            return {
                sortOrders: {
                    [columnKey]: {
                        order: { $set: ORDER.dsc },
                        logicalOrder: { $set: maxOrder },
                    },
                },
            };
        }

        handleHeaderClick = (columnKey) => {
            const {
                settings,
                onChange,
            } = this.props;

            const { sortOrders } = settings;
            const updateSettings = MultiSortedComponent.getAction(columnKey, sortOrders);
            onChange(update(settings, updateSettings));
        }

        modifyColumns = memoize((columns = [], sortOrders = {}) => {
            if (!columns || columns.length <= 0) {
                return columns;
            }

            const settings = {};
            columns.forEach((column, index) => {
                const { order } = sortOrders[column.key] || {};
                settings[index] = {
                    sortOrder: { $set: order },
                    sortable: { $set: !!column.comparator },
                    onHeaderClick: { $set: this.handleHeaderClick },
                };
            });

            return update(columns, settings);
        })

        render() {
            const {
                data,
                settings,
                columns,
                onChange,
                ...otherProps
            } = this.props;

            const newData = MultiSortedComponent.sortData(data, columns, settings.sortOrders);
            const newColumns = this.modifyColumns(columns, settings.sortOrders);

            return (
                <WrappedComponent
                    data={newData}
                    columns={newColumns}
                    settings={settings}
                    onChange={onChange}
                    {...otherProps}
                />
            );
        }
    };
    return hoistNonReactStatics(MultiSortedComponent, WrappedComponent);
};
