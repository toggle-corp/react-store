import React from 'react';
import PropTypes from 'prop-types';
import hoistNonReactStatics from 'hoist-non-react-statics';

import update from '../../../../utils/immutable-update';
import { isFalsy } from '../../../../utils/common';

import styles from './styles.scss';

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
    const ColumnWidthComponent = class extends React.PureComponent {
        static propTypes = propTypes;
        static defaultProps = defaultProps;

        constructor(props) {
            super(props);

            this.originalHeaderRenderers = {};
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

        handleSeparatorMouseDown = (columnKey, e) => {
            this.resizingColumnKey = columnKey;
            this.startMouseX = e.clientX;
            this.lastMouseX = e.clientX;
            window.addEventListener('mousemove', this.handleMouseMove);
            window.addEventListener('mouseup', this.handleMouseUp);
        }

        renderHeader = (p) => {
            const { columnKey } = p;
            const OriginalHeader = this.originalHeaderRenderers[columnKey];

            return (
                <div className={styles.newHeader}>
                    <div className={styles.originalHeaderContainer}>
                        <OriginalHeader
                            columnKey={columnKey}
                            {...p}
                        />
                    </div>
                    {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
                    <div
                        onMouseDown={(e) => { this.handleSeparatorMouseDown(columnKey, e); }}
                        className={styles.separator}
                    />
                </div>
            );
        }

        render() {
            const {
                columns,
                settings,
                ...otherProps
            } = this.props;

            const { columnWidths } = settings;

            const newColumns = columns.map((column) => {
                this.originalHeaderRenderers[column.key] = column.headerRenderer;

                if (
                    (settings[column.key] || {}).headerStyle
                    && (settings[column.key] || {}).cellStyle
                ) {
                    return column;
                }

                return ({
                    ...column,
                    headerRenderer: this.renderHeader,
                    headerStyle: { width: columnWidths[column.key] },
                    cellStyle: { width: columnWidths[column.key] },
                });
            });

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
