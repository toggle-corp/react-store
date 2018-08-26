import React from 'react';
import PropTypes from 'prop-types';
import hoistNonReactStatics from 'hoist-non-react-statics';

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
            _columnKey: columnKey,
            _headerRenderer: Header,
            _onSeparatorMouseDown: onSeparatorMouseDown, // eslint-disable-line no-unused-vars
            ...otherProps
        } = this.props;

        return (
            <div className={styles.newHeader}>
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

            const dx = e.clientX - this.lastMouseX;
            this.lastMouseX = e.clientX;

            const updateSettings = {
                columnWidths: { $auto: {
                    [this.resizingColumnKey]: {
                        $apply: val => (isFalsy(val) ? dx : val + dx),
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

        render() {
            const {
                columns,
                settings,
                ...otherProps
            } = this.props;

            const { columnWidths } = settings;

            const updateSettings = {};
            columns.forEach((column, i) => {
                // NOTE: column key is assumed to be column.key
                const columnKey = column.key;

                const {
                    [column.key]: {
                        headerStyle,
                        cellStyle,
                    } = {},
                } = settings;

                if (headerStyle && cellStyle) {
                    return;
                }

                updateSettings[i] = {
                    headerRendererParams: {
                        $set: (...params) => ({
                            ...column.headerRendererParams(...params),
                            _columnKey: columnKey,
                            _headerRenderer: column.headerRenderer,
                            _onSeparatorMouseDown: this.handleSeparatorMouseDown,
                        }),
                    },
                    headerRenderer: { $set: ResizableHeader },
                    headerStyle: { $set: { width: columnWidths[columnKey] } },
                    cellStyle: { $set: { width: columnWidths[columnKey] } },
                };
            });

            const newColumns = update(columns, updateSettings);

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
