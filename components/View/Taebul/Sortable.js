import React from 'react';
import PropTypes from 'prop-types';
import hoistNonReactStatics from 'hoist-non-react-statics';
import memoize from 'memoize-one';

import update from '../../../utils/immutable-update';

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
    const SortedComponent = class extends React.PureComponent {
        static propTypes = propTypes;
        static defaultProps = defaultProps;

        static sortData = memoize((data, columns = [], sortOrder) => {
            if (!sortOrder) {
                return data;
            }

            const { key, order } = sortOrder;
            const { comparator } = columns.find(c => c.key === key);
            if (!comparator) {
                console.warn(`comparator not defined for column ${key}`);
                return data;
            }

            return [...data].sort((foo, bar) => comparator(foo, bar, order === ORDER.dsc ? -1 : 1));
        })

        static getAction = (columnKey, sortOrder) => {
            if (!sortOrder || columnKey !== sortOrder.key) {
                const newEntry = {
                    key: columnKey,
                    order: ORDER.asc,
                };
                return {
                    sortOrder: { $set: newEntry },
                };
            }
            return {
                sortOrder: {
                    order: { $apply: val => (val === ORDER.asc ? ORDER.dsc : ORDER.asc) },
                },
            };
        }

        handleHeaderClick = (columnKey) => {
            const {
                settings,
                onChange,
            } = this.props;

            const { sortOrder } = settings;
            const updateSettings = SortedComponent.getAction(columnKey, sortOrder);
            onChange(update(settings, updateSettings));
        }

        modifyColumns = memoize((columns = [], sortOrder = {}) => {
            if (!columns || columns.length <= 0) {
                return columns;
            }

            const settings = {};
            columns.forEach((column, index) => {
                const { order } = sortOrder.key === column.key ? sortOrder : {};
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

            const newData = SortedComponent.sortData(data, columns, settings.sortOrder);
            const newColumns = this.modifyColumns(columns, settings.sortOrder);

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
    return hoistNonReactStatics(SortedComponent, WrappedComponent);
};
