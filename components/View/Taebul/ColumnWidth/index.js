import React from 'react';
import PropTypes from 'prop-types';
import hoistNonReactStatics from 'hoist-non-react-statics';
import memoize from 'memoize-one';

import update from '../../../../utils/immutable-update';
import { isFalsy } from '../../../../utils/common';

import styles from './styles.scss';

class ResizableHeader extends React.PureComponent {
    handleSeparatorMouseDown = (e) => {
        const {
            _columnKey: columnKey,
            _onSeparatorMouseDown: onSeparatorMouseDown,
        } = this.props;
        onSeparatorMouseDown(e, columnKey);
    }

    render() {
        const {
            _columnKey: columnKey, // eslint-disable-line no-unused-vars
            _headerRenderer: Header, // eslint-disable-line no-unused-vars
            _onSeparatorMouseDown: onSeparatorMouseDown, // eslint-disable-line no-unused-vars
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

const DEFAULT_WIDTH = 200;

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

export default (WrappedComponent) => {
    // eslint-disable-next-line react/no-multi-comp
    const ColumnWidthComponent = class extends React.PureComponent {
        static propTypes = propTypes;
        static defaultProps = defaultProps;

        static columnKeySelector = column => column.key;

        constructor(props) {
            super(props);

            this.resizingColumnKey = undefined;
        }

        handleMouseMove = (e) => {
            const {
                settings,
                onChange,
            } = this.props;

            const { defaultColumnWidth = DEFAULT_WIDTH } = settings;

            const dx = e.clientX - this.lastMouseX;
            this.lastMouseX = e.clientX;

            const updateSettings = {
                columnWidths: { $auto: {
                    [this.resizingColumnKey]: {
                        $apply: val => (isFalsy(val) ? defaultColumnWidth + dx : val + dx),
                    },
                } },
            };

            const newSettings = update(settings, updateSettings);
            onChange(newSettings);
        }

        handleMouseUp = () => {
            window.removeEventListener('mousemove', this.handleMouseMove);
        }

        handleSeparatorMouseDown = (e, columnKey) => {
            this.resizingColumnKey = columnKey;
            this.startMouseX = e.clientX;
            this.lastMouseX = e.clientX;
            window.addEventListener('mousemove', this.handleMouseMove);
            window.addEventListener('mouseup', this.handleMouseUp);
        }

        modifyColumns = memoize((columns = [], columnWidths = {}, defaultWidth) => {
            if (!columns || columns.length <= 0) {
                return columns;
            }

            const settings = {};
            columns.forEach((column, i) => {
                // NOTE: column key is assumed to be column.key
                const columnKey = column.key;
                const width = isFalsy(columnWidths[columnKey])
                    ? defaultWidth
                    : columnWidths[columnKey];

                settings[i] = {
                    headerRendererParams: {
                        $set: (...params) => ({
                            ...column.headerRendererParams(...params),
                            _columnKey: columnKey,
                            _headerRenderer: column.headerRenderer,
                            _onSeparatorMouseDown: this.handleSeparatorMouseDown,
                        }),
                    },
                    headerRenderer: { $set: ResizableHeader },
                    headerStyle: { $set: { width } },
                    cellStyle: { $set: { width } },
                };
            });

            return update(columns, settings);
        })

        render() {
            const {
                columns,
                settings,
                ...otherProps
            } = this.props;

            const {
                columnWidths,
                defaultColumnWidth = DEFAULT_WIDTH,
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
