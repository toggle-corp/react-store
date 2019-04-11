import React from 'react';
import PropTypes from 'prop-types';
import hoistNonReactStatics from 'hoist-non-react-statics';
import memoize from 'memoize-one';
import produce from 'immer';

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

        sortData = memoize((data, columns = [], sortOrder) => {
            if (!sortOrder || !sortOrder.key || !sortOrder.order) {
                return data;
            }

            const { key, order } = sortOrder;
            const column = columns.find(c => c.key === key);
            if (!column) {
                console.warn(`column not defined for column ${key}`);
                return data;
            }
            const { comparator } = column;
            if (!comparator) {
                console.warn(`comparator not defined for column ${key}`);
                return data;
            }

            return [...data].sort((foo, bar) => comparator(foo, bar, order === ORDER.dsc ? -1 : 1));
        })

        handleHeaderClick = (columnKey) => {
            const {
                settings,
                onChange,
            } = this.props;

            const { sortOrder } = settings;

            const newSettings = produce(settings, (draftSettings) => {
                if (!sortOrder || columnKey !== sortOrder.key) {
                    // eslint-disable-next-line no-param-reassign
                    draftSettings.sortOrder = {
                        key: columnKey,
                        order: ORDER.asc,
                    };
                } else {
                    // eslint-disable-next-line no-param-reassign
                    draftSettings.sortOrder.order = draftSettings.sortOrder.order === ORDER.asc
                        ? ORDER.dsc
                        : ORDER.asc;
                }
            });

            onChange(newSettings);
        }

        modifyColumns = memoize((columns = [], sortOrder = {}) => {
            if (!columns || columns.length <= 0) {
                return columns;
            }

            const newColumns = produce(columns, (draftColumns) => {
                draftColumns.forEach((column, index) => {
                    const { order } = sortOrder.key === column.key ? sortOrder : {};
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

            const newData = this.sortData(data, columns, settings.sortOrder);
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
