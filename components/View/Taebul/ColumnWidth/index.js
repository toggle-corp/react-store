import React from 'react';
import PropTypes from 'prop-types';
import hoistNonReactStatics from 'hoist-non-react-statics';
import memoize from 'memoize-one';
import produce from 'immer';
import { isFalsy } from '@togglecorp/fujs';

import styles from './styles.scss';

const DEFAULT_MIN_COLUMN_WIDTH = 96;
const DEFAULT_COLUMN_WIDTH = 204;

class ResizableHeader extends React.Component {
    static propTypes = {
        _columnKey: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
        ]).isRequired,
        _onSeparatorMouseDown: PropTypes.func.isRequired,
        _headerRenderer: PropTypes.func.isRequired,
        className: PropTypes.string,
    }

    static defaultProps = {
        className: '',
    }

    handleSeparatorMouseDown = (e) => {
        const {
            _columnKey: columnKey,
            _onSeparatorMouseDown: onSeparatorMouseDown,
        } = this.props;
        onSeparatorMouseDown(e, columnKey);
    }

    render() {
        const {
            // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
            _columnKey: columnKey,
            // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
            _onSeparatorMouseDown: onSeparatorMouseDown,
            // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
            _headerRenderer: Header,
            className: classNameFromProps,
            ...otherProps
        } = this.props;

        const className = `
            ${classNameFromProps}
            ${styles.newHeader}
        `;

        return (
            <div className={className}>
                <div className={styles.originalHeaderContainer}>
                    <Header {...otherProps} />
                </div>
                {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
                <div
                    onMouseDown={this.handleSeparatorMouseDown}
                    className={styles.separator}
                />
            </div>
        );
    }
}


// NOTE: for now default width cannot be set
const propTypes = {
    columns: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    settings: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    onChange: PropTypes.func.isRequired,
};

const defaultProps = {
    columns: [],
    settings: {},
};

const MAX_IDLE_TIMEOUT = 200;

export default (WrappedComponent) => {
    // eslint-disable-next-line react/no-multi-comp
    const ColumnWidthComponent = class extends React.Component {
        static propTypes = propTypes;

        static defaultProps = defaultProps;

        static columnKeySelector = column => column.key;

        constructor(props) {
            super(props);

            this.resizingColumnKey = undefined;
        }

        modifyColumns = memoize((columns = [], columnWidths = {}, defaultWidth) => {
            if (!columns || columns.length <= 0) {
                return columns;
            }

            const newColumns = produce(columns, (draftColumns) => {
                draftColumns.forEach((column, index) => {
                    // NOTE: column key is assumed to be column.key
                    const {
                        key: columnKey,
                        headerRendererParams,
                        headerRenderer,
                    } = column;
                    const width = isFalsy(columnWidths[columnKey])
                        ? defaultWidth
                        : columnWidths[columnKey];
                    // eslint-disable-next-line no-param-reassign
                    draftColumns[index].headerRendererParams = (...params) => ({
                        ...headerRendererParams(...params),
                        _columnKey: columnKey,
                        _headerRenderer: headerRenderer,
                        _onSeparatorMouseDown: this.handleSeparatorMouseDown,
                    });
                    // eslint-disable-next-line no-param-reassign
                    draftColumns[index].headerRenderer = ResizableHeader;
                    // eslint-disable-next-line no-param-reassign
                    draftColumns[index].headerStyle = { width };
                    // eslint-disable-next-line no-param-reassign
                    draftColumns[index].cellStyle = { width };
                });
            });

            return newColumns;
        })

        handleMouseMove = (e) => {
            const {
                settings,
                onChange,
            } = this.props;

            window.cancelIdleCallback(this.idleCallback);
            this.idleCallback = window.requestIdleCallback(() => {
                const dx = e.clientX - this.startMouseX;
                this.lastMouseX = e.clientX;

                const {
                    defaultColumnWidth = DEFAULT_COLUMN_WIDTH,
                    minColumnWidth = DEFAULT_MIN_COLUMN_WIDTH,
                } = settings;

                const newSettings = produce(settings, (draftSettings) => {
                    if (!draftSettings.columnWidths) {
                        // eslint-disable-next-line no-param-reassign
                        draftSettings.columnWidths = {};
                    }

                    // const value = draftSettings.columnWidths[this.resizingColumnKey];
                    const value = this.resizingColumnInitialWidth;
                    let newValue = isFalsy(value)
                        ? defaultColumnWidth + dx
                        : value + dx;

                    if (newValue < minColumnWidth) {
                        newValue = minColumnWidth;
                    }

                    // eslint-disable-next-line no-param-reassign
                    draftSettings.columnWidths[this.resizingColumnKey] = newValue;
                });

                onChange(newSettings);
            }, { timeout: MAX_IDLE_TIMEOUT });
        }

        handleMouseUp = () => {
            window.removeEventListener('mousemove', this.handleMouseMove);
            this.resizingColumnKey = undefined;
        }

        handleSeparatorMouseDown = (e, columnKey) => {
            const {
                settings: {
                    columnWidths = {},
                    defaultColumnWidth = DEFAULT_COLUMN_WIDTH,
                },
            } = this.props;

            this.resizingColumnKey = columnKey;
            this.resizingColumnInitialWidth = columnWidths[columnKey] || defaultColumnWidth;
            this.startMouseX = e.clientX;
            this.lastMouseX = e.clientX;

            window.addEventListener('mousemove', this.handleMouseMove);
            window.addEventListener('mouseup', this.handleMouseUp);
        }


        render() {
            const {
                columns,
                settings,
                ...otherProps
            } = this.props;

            const {
                columnWidths,
                defaultColumnWidth = DEFAULT_COLUMN_WIDTH,
            } = settings;

            const newColumns = this.modifyColumns(columns, columnWidths, defaultColumnWidth);
            return (
                <WrappedComponent
                    columns={newColumns}
                    settings={settings}
                    {...otherProps}
                />
            );
        }
    };

    return hoistNonReactStatics(ColumnWidthComponent, WrappedComponent);
};
