import React from 'react';
import PropTypes from 'prop-types';
import hoistNonReactStatics from 'hoist-non-react-statics';
import memoize from 'memoize-one';

import AccentButton from '../../Action/Button/AccentButton';
import Checkbox from '../../Input/Checkbox';

import update from '../../../utils/immutable-update';
import { iconNames } from '../../../constants';

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
    const SelectedComponent = class extends React.PureComponent {
        static propTypes = propTypes;
        static defaultProps = defaultProps;

        static selectData = memoize((data = [], selectedKeys = {}, keySelector) => {
            if (!selectedKeys) {
                return data;
            }

            const settings = {};
            data.forEach((datum, index) => {
                const datumKey = keySelector(datum);
                if (selectedKeys[datumKey]) {
                    settings[index] = { _isSelected: { $set: true } };
                }
            });
            return update(data, settings);
        })

        handleSelectableClick = (datumKey, isSelected) => {
            const {
                settings,
                onChange,
            } = this.props;
            let updateSettings;
            if (isSelected) {
                updateSettings = {
                    selectedKeys: { $auto: {
                        [datumKey]: { $set: true },
                    } },
                };
            } else {
                updateSettings = {
                    selectedKeys: { $auto: {
                        $unset: [datumKey],
                    } },
                };
            }
            const newSettings = update(settings, updateSettings);
            onChange(newSettings);
        }

        handleUnselectAllClick = () => {
            const {
                settings,
                onChange,
            } = this.props;
            const updateSettings = {
                selectedKeys: { $set: {} },
            };
            const newSettings = update(settings, updateSettings);
            onChange(newSettings);
        }

        handleSelectAllClick = () => {
            const {
                settings,
                onChange,
                data,
                keySelector,
            } = this.props;
            const updateSettings = {
                selectedKeys: { $auto: {
                } },
            };
            data.forEach((datum) => {
                const key = keySelector(datum);
                updateSettings.selectedKeys.$auto[key] = { $set: true };
            });
            const newSettings = update(settings, updateSettings);
            onChange(newSettings);
        }

        modifyColumns = memoize((columns = [], data = [], selectClassName, keySelector) => {
            const settings = {
                $unshift: [{
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
                        let buttonClassName;
                        let buttonAction;
                        if (isEverySelected) {
                            buttonClassName = iconNames.checkbox;
                            buttonAction = onUnselectAllClick;
                        } else if (isNoneSelected) {
                            buttonClassName = iconNames.checkboxOutlineBlank;
                            buttonAction = onSelectAllClick;
                        } else {
                            buttonClassName = iconNames.checkboxBlank;
                            buttonAction = onUnselectAllClick;
                        }

                        return (
                            <div className={className}>
                                <AccentButton
                                    className={buttonClassName}
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
                }],
            };
            return update(columns, settings);
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

            const newData = SelectedComponent.selectData(
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
