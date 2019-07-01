import React from 'react';
import PropTypes from 'prop-types';
import hoistNonReactStatics from 'hoist-non-react-statics';
import memoize from 'memoize-one';
import produce from 'immer';
import { mapToList } from '@togglecorp/fujs';


const propTypes = {
    data: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    columns: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    settings: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    onChange: PropTypes.func,
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
    const MultiSortedComponent = class extends React.Component {
        static propTypes = propTypes;

        static defaultProps = defaultProps;

        sortData = memoize((data, columns = [], sortOrders = {}) => {
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

        handleHeaderClick = (columnKey) => {
            const {
                settings,
                onChange,
            } = this.props;

            const newSettings = produce(settings, (draftSettings) => {
                if (!draftSettings.sortOrders) {
                    // eslint-disable-next-line no-param-reassign
                    draftSettings.sortOrders = {};
                }

                const logicalOrderList = mapToList(draftSettings.sortOrders, s => s.logicalOrder);
                const maxOrder = Math.max(...logicalOrderList, 0) + 1;
                const sortOrder = draftSettings.sortOrders[columnKey];
                if (!sortOrder) {
                    // eslint-disable-next-line no-param-reassign
                    draftSettings.sortOrders[columnKey] = {
                        key: columnKey,
                        order: ORDER.asc,
                        logicalOrder: maxOrder,
                    };
                } else if (sortOrder.order === ORDER.dsc) {
                    // eslint-disable-next-line no-param-reassign
                    delete draftSettings.sortOrders[columnKey];
                } else {
                    // eslint-disable-next-line no-param-reassign
                    draftSettings.sortOrders[columnKey].order = ORDER.dsc;
                    // eslint-disable-next-line no-param-reassign
                    draftSettings.sortOrders[columnKey].logicalOrder = maxOrder;
                }
            });

            onChange(newSettings);
        }

        modifyColumns = memoize((columns = [], sortOrders = {}) => {
            if (!columns || columns.length <= 0) {
                return columns;
            }

            const newColumns = produce(columns, (draftColumns) => {
                draftColumns.forEach((column, index) => {
                    const { order } = sortOrders[column.key] || {};
                    // eslint-disable-next-line no-param-reassign
                    draftColumns[index].sortOrder = order;
                    // eslint-disable-next-line no-param-reassign
                    draftColumns[index].sortable = !!column.comparator;
                    // eslint-disable-next-line no-param-reassign
                    draftColumns[index].onSortClick = this.handleHeaderClick;
                });
            });

            return newColumns;
        })

        render() {
            const {
                data,
                settings,
                columns,
                onChange,
                ...otherProps
            } = this.props;

            const newData = this.sortData(data, columns, settings.sortOrders);
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
