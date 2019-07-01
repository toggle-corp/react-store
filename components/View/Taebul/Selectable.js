import React from 'react';
import PropTypes from 'prop-types';
import hoistNonReactStatics from 'hoist-non-react-statics';
import memoize from 'memoize-one';
import produce from 'immer';
import { isFalsy } from '@togglecorp/fujs';

import AccentButton from '../../Action/Button/AccentButton';
import Checkbox from '../../Input/Checkbox';

const propTypes = {
    data: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    columns: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    settings: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    onChange: PropTypes.func,
    keySelector: PropTypes.func,
    selectClassName: PropTypes.string,
};

const defaultProps = {
    data: [],
    columns: [],
    settings: {},
    onChange: () => {},
    keySelector: datum => datum.key,
    selectClassName: '',
};

export const ORDER = {
    asc: 'asc',
    dsc: 'dsc',
};

export default (WrappedComponent) => {
    const SelectedComponent = class extends React.Component {
        static propTypes = propTypes;

        static defaultProps = defaultProps;

        handleSelectableClick = (datumKey, isSelected) => {
            const {
                settings,
                onChange,
            } = this.props;

            const newSettings = produce(settings, (draftSettings) => {
                if (!draftSettings.selectedKeys) {
                    // eslint-disable-next-line no-param-reassign
                    draftSettings.selectedKeys = {};
                }
                if (isSelected) {
                    // eslint-disable-next-line no-param-reassign
                    draftSettings.selectedKeys[datumKey] = true;
                } else {
                    // eslint-disable-next-line no-param-reassign
                    delete draftSettings.selectedKeys[datumKey];
                }
            });

            onChange(newSettings);
        }

        handleUnselectAllClick = () => {
            const {
                settings,
                onChange,
            } = this.props;

            const newSettings = produce(settings, (draftSettings) => {
                // eslint-disable-next-line no-param-reassign
                draftSettings.selectedKeys = {};
            });

            onChange(newSettings);
        }

        handleSelectAllClick = () => {
            const {
                settings,
                onChange,
                data,
                keySelector,
            } = this.props;

            const newSettings = produce(settings, (draftSettings) => {
                if (!draftSettings.selectedKeys) {
                    // eslint-disable-next-line no-param-reassign
                    draftSettings.selectedKeys = {};
                }
                data.forEach((datum) => {
                    const key = keySelector(datum);
                    // eslint-disable-next-line no-param-reassign
                    draftSettings.selectedKeys[key] = true;
                });
            });

            onChange(newSettings);
        }

        selectData = memoize((data = [], selectedKeys, keySelector) => {
            if (isFalsy(selectedKeys) || Object.keys(selectedKeys).length <= 0) {
                return data;
            }
            const newData = produce(data, (draftData) => {
                draftData.forEach((datum, index) => {
                    const key = keySelector(datum);
                    if (selectedKeys[key]) {
                        // eslint-disable-next-line no-param-reassign, no-underscore-dangle
                        draftData[index]._isSelected = true;
                    }
                });
            });

            return newData;
        })

        modifyColumns = memoize((columns = [], data = [], selectClassName, keySelector) => {
            const selectColumn = {
                key: '_select',
                title: '',

                headerRendererParams: (params) => {
                    const { settings: settingsFromProps } = params;

                    const { selectedKeys } = settingsFromProps;

                    const isEverySelected = selectedKeys
                        ? data.every(datum => selectedKeys[keySelector(datum)])
                        : false;

                    const isNoneSelected = selectedKeys
                        ? data.every(datum => !selectedKeys[keySelector(datum)])
                        : true;

                    return {
                        className: selectClassName,
                        isEverySelected,
                        isNoneSelected,
                        onUnselectAllClick: this.handleUnselectAllClick,
                        onSelectAllClick: this.handleSelectAllClick,
                    };
                },

                headerRenderer: ({
                    className,
                    isEverySelected,
                    onUnselectAllClick,
                    onSelectAllClick,
                    isNoneSelected,
                }) => {
                    let buttonIcon;
                    let buttonAction;
                    if (isEverySelected) {
                        buttonIcon = 'checkbox';
                        buttonAction = onUnselectAllClick;
                    } else if (isNoneSelected) {
                        buttonIcon = 'checkboxOutlineBlank';
                        buttonAction = onSelectAllClick;
                    } else {
                        buttonIcon = 'checkboxBlank';
                        buttonAction = onUnselectAllClick;
                    }

                    return (
                        <div className={className}>
                            <AccentButton
                                className={buttonIcon}
                                onClick={buttonAction}
                                transparent
                            />
                        </div>
                    );
                },

                cellRendererParams: ({ datum, datumKey }) => ({
                    label: '',
                    // eslint-disable-next-line no-underscore-dangle
                    value: datum._isSelected,
                    className: selectClassName,
                    onChange: value => this.handleSelectableClick(datumKey, value),
                }),

                cellRenderer: Checkbox,
            };

            const newColumns = produce(columns, (draftColumns) => {
                draftColumns.unshift(selectColumn);
            });

            return newColumns;
        })

        render() {
            const {
                data,
                settings,
                columns,
                onChange,
                keySelector,
                selectClassName,
                ...otherProps
            } = this.props;

            const newData = this.selectData(
                data,
                settings.selectedKeys,
                keySelector,
            );
            const newColumns = this.modifyColumns(

                columns,
                data,
                selectClassName,
                keySelector,
            );

            return (
                <WrappedComponent
                    data={newData}
                    columns={newColumns}
                    settings={settings}
                    onChange={onChange}
                    keySelector={keySelector}
                    {...otherProps}
                />
            );
        }
    };
    return hoistNonReactStatics(SelectedComponent, WrappedComponent);
};
