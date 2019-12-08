import React from 'react';
import PropTypes from 'prop-types';
import mapboxgl from 'mapbox-gl';
import ReactDOM from 'react-dom';

import { isDefined, difference, isNotDefined } from '@togglecorp/fujs';

import MapChild from '../MapChild';
import { forEach } from '../../../../utils/common';

const emptyList = [];

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    map: PropTypes.object.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    type: PropTypes.string.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    paint: PropTypes.object.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    layout: PropTypes.object,
    // eslint-disable-next-line react/forbid-prop-types
    filter: PropTypes.array,

    layerKey: PropTypes.string.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    sourceKey: PropTypes.string.isRequired,
    sourceLayer: PropTypes.string,

    setDestroyer: PropTypes.func,
    mapStyle: PropTypes.string.isRequired,

    // eslint-disable-next-line react/no-unused-prop-types
    onClick: PropTypes.func,
    // eslint-disable-next-line react/no-unused-prop-types
    onDoubleClick: PropTypes.func,

    showToolTipOnHover: PropTypes.bool,
    showToolTipOnDoubleClick: PropTypes.bool,
    selectionOnDoubleClick: PropTypes.bool,

    // eslint-disable-next-line react/forbid-prop-types, react/no-unused-prop-types
    mapState: PropTypes.array,

    // eslint-disable-next-line react/no-unused-prop-types
    enableHover: PropTypes.bool,
    // eslint-disable-next-line react/no-unused-prop-types
    hoveredId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    // eslint-disable-next-line react/no-unused-prop-types
    onHoverChange: PropTypes.func,

    // eslint-disable-next-line react/no-unused-prop-types
    enableSelection: PropTypes.bool,
    // eslint-disable-next-line react/no-unused-prop-types, react/forbid-prop-types
    selectedIds: PropTypes.array,
    // eslint-disable-next-line react/no-unused-prop-types
    onSelectionChange: PropTypes.func,

    // eslint-disable-next-line react/no-unused-prop-types
    minzoom: PropTypes.number,
    // eslint-disable-next-line react/no-unused-prop-types
    maxzoom: PropTypes.number,

    onAnimationKeyframe: PropTypes.func,
};

const defaultProps = {
    layout: undefined,
    filter: undefined,
    onClick: undefined,
    onDoubleClick: undefined,
    sourceLayer: undefined,
    setDestroyer: undefined,
    onHoverChange: undefined,
    enableHover: undefined,
    hoveredId: undefined,
    onSelectionChange: undefined,
    enableSelection: undefined,
    selectedIds: emptyList,
    minzoom: undefined,
    maxzoom: undefined,
    mapState: undefined,
    onAnimationKeyframe: undefined,
    showToolTipOnHover: false,
    showToolTipOnDoubleClick: false,
    selectionOnDoubleClick: false,
};

const changeSelectionState = (map, sourceKey, sourceLayer, oldSelectedIds, newSelectedIds) => {
    const oldSelectionIdSet = new Set(oldSelectedIds);
    const newSelectionIdSet = new Set(newSelectedIds);

    const toRemove = difference(oldSelectionIdSet, newSelectionIdSet);
    const toAdd = difference(newSelectionIdSet, oldSelectionIdSet);

    toRemove.forEach((id) => {
        map.removeFeatureState(
            { source: sourceKey, id, sourceLayer },
            'selected',
        );
    });
    toAdd.forEach((id) => {
        map.setFeatureState(
            { source: sourceKey, id, sourceLayer },
            { selected: true },
        );
    });
};

const clearHoverState = (map, sourceKey, sourceLayer, oldHoveredId) => {
    if (oldHoveredId) {
        map.removeFeatureState(
            { source: sourceKey, id: oldHoveredId, sourceLayer },
            'hover',
        );
    }
};

const changeHoverState = (map, sourceKey, sourceLayer, oldHoveredId, newHoveredId) => {
    clearHoverState(map, sourceKey, sourceLayer, oldHoveredId);

    if (newHoveredId) {
        map.setFeatureState(
            { source: sourceKey, id: newHoveredId, sourceLayer },
            { hover: true },
        );
    }
};

const setMapState = (
    map,
    sourceKey,
    sourceLayer,
    newMapState,
    newSelectedIds,
    newHoveredId,
) => {
    // NOTE: map state is shared between every map layers of a map source
    // So, if mapState is not defined, it will not update the map state internally
    // To clear out mapState, we should implicitly set mapState to emptyArray
    if (isNotDefined(newMapState)) {
        return;
    }

    // Remove everything for a source
    map.removeFeatureState({
        source: sourceKey,
        sourceLayer,
    });

    // add new map state
    newMapState.forEach((item) => {
        map.setFeatureState(
            { source: sourceKey, id: item.id, sourceLayer },
            item.value,
        );
    });

    // add hoverId
    changeSelectionState(map, sourceKey, sourceLayer, undefined, newSelectedIds);
    // add selectedIds
    changeHoverState(map, sourceKey, sourceLayer, undefined, newHoveredId);
};

class MapLayer extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        if (props.setDestroyer) {
            props.setDestroyer(props.layerKey, this.destroy);
        }

        this.eventHandlers = {};
        this.layer = undefined;
        this.popup = undefined;
    }

    componentDidMount() {
        this.tooltipContainer = document.createElement('div');
        this.create(this.props);
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        const {
            map: oldMap,
            mapStyle: oldMapStyle,
            layout: oldLayout,
            paint: oldPaint,
            filter: oldFilter,
            hoveredId: oldHoveredId,
            selectedIds: oldSelectedIds,
            sourceLayer: oldSourceLayer,
            mapState: oldMapState,
        } = this.props;
        const {
            map: newMap,
            mapStyle: newMapStyle,
            layout: newLayout,
            paint: newPaint,
            filter: newFilter,
            hoveredId: newHoveredId,
            selectedIds: newSelectedIds,
            sourceKey,
            sourceLayer: newSourceLayer,
            mapState: newMapState,
        } = nextProps;

        if (
            oldMap !== newMap
            || oldMapStyle !== newMapStyle
            || oldSourceLayer !== newSourceLayer
        ) {
            this.destroy();
            this.create(nextProps);
            return;
        }

        if (oldMapState !== newMapState) {
            setMapState(
                newMap, sourceKey, newSourceLayer, newMapState, newSelectedIds, newHoveredId,
            );
        }

        if (
            oldHoveredId !== newHoveredId
            && this.stateHoveredId !== newHoveredId
        ) {
            // if mapState has changed, then it will clear out the hovered state
            // and set it appropriately, so no need to handle it again
            if (oldMapState === newMapState) {
                changeHoverState(
                    newMap, sourceKey, newSourceLayer, this.stateHoveredId, newHoveredId,
                );
            }
            this.stateHoveredId = newHoveredId;
        }

        if (
            oldSelectedIds !== newSelectedIds
            && this.stateSelectedIds !== newSelectedIds
        ) {
            // if mapState has changed, then it will clear out the selected state
            // and set it appropriately, so no need to handle it again
            if (oldMapState === newMapState) {
                changeSelectionState(
                    newMap, sourceKey, newSourceLayer, this.stateSelectedIds, newSelectedIds,
                );
            }
            this.stateSelectedIds = newSelectedIds;
        }

        if (this.layer && oldLayout !== newLayout) {
            this.reloadLayout(nextProps);
        }
        if (this.layer && oldPaint !== newPaint) {
            this.reloadPaint(nextProps);
        }
        if (this.layer && oldFilter !== newFilter) {
            this.reloadFilter(nextProps);
        }
    }

    componentWillUnmount() {
        if (this.tooltipContainer) {
            this.tooltipContainer.remove();
        }

        cancelAnimationFrame(this.animationKey);

        this.destroy();
    }

    reloadLayout = (props) => {
        const {
            map,
            layerKey,
            layout,
        } = props;

        forEach(layout, (key, lay) => {
            map.setLayoutProperty(layerKey, key, lay);
        });
    }

    reloadPaint = (props) => {
        const {
            map,
            layerKey,
            paint,
        } = props;

        forEach(paint, (key, pai) => {
            map.setPaintProperty(layerKey, key, pai);
        });
    }

    reloadFilter = (props) => {
        const {
            map,
            layerKey,
            filter,
        } = props;

        map.setFilter(layerKey, filter);
    }

    destroyHandlers = (map, layerKey) => {
        forEach(this.eventHandlers, (type, listener) => {
            // console.info('Removing layer event handler', layerKey);
            map.off(type, layerKey, listener);
        });
        this.eventHandlers = {};
    }

    destroy = () => {
        const {
            map,
            layerKey,
        } = this.props;
        if (!map) {
            return;
        }

        this.destroyHandlers(map, layerKey);

        if (this.layer) {
            // console.info('Removing layer', layerKey);
            map.removeLayer(this.layer);
            this.layer = undefined;
        }
        if (this.popup) {
            // console.info('Removing popup layer', layerKey);
            this.popup.remove();
            this.popup = undefined;
        }
    }

    create = (props) => {
        const {
            map,
            sourceKey,
            layerKey,
            sourceLayer,
            type,
            paint,
            layout,
            filter,
            // enableHover,
            // enableSelection,
            tooltipRenderer,
            tooltipRendererParams,
            onClick,
            onDoubleClick,
            mapState,
            hoveredId,
            selectedIds,
            onHoverChange,
            onSelectionChange,
            minzoom,
            maxzoom,
            onAnimationKeyframe,
        } = props;

        if (this.animationKey) {
            cancelAnimationFrame(this.animationKey);
        }

        const layerInfo = {
            id: layerKey,
            source: sourceKey,
            type,
        };
        if (paint) {
            layerInfo.paint = paint;
        }
        if (layout) {
            layerInfo.layout = layout;
        }
        if (filter) {
            layerInfo.filter = filter;
        }
        if (sourceLayer) {
            layerInfo['source-layer'] = sourceLayer;
        }
        if (isDefined(minzoom)) {
            layerInfo.minzoom = minzoom;
        }
        if (isDefined(maxzoom)) {
            layerInfo.maxzoom = maxzoom;
        }
        // NOTE: we use this information later to identify clickable layers
        layerInfo.metadata = {
            selectionEnabled: !!onSelectionChange,
            hoverEnabled: !!onHoverChange,
        };
        // console.info('Adding layer', layerKey);
        map.addLayer(layerInfo);

        this.layer = layerKey;

        // FIXME: remove this.stateHoveredId and this.state.stateSelectedIds
        this.stateHoveredId = undefined;
        this.stateSelectedIds = emptyList;

        // Change the cursor to a pointer when the mouse is over the places layer.
        this.eventHandlers.mouseenter = (e) => {
            const {
                enableSelection,
                enableHover,
                showToolTipOnHover,
            } = this.props;

            const selectionEnabled = !!onSelectionChange && enableSelection;
            const hoverEnabled = !!onHoverChange && enableHover;

            if (selectionEnabled || hoverEnabled || tooltipRenderer || onClick || onDoubleClick) {
                // eslint-disable-next-line no-param-reassign
                map.getCanvas().style.cursor = 'pointer';
            }

            const {
                lngLat: coordinates,
                features,
            } = e;
            // Get first feature (it looks to be the top-most)
            const { id, properties } = features[0];

            if (tooltipRenderer && showToolTipOnHover) {
                const Tooltip = tooltipRenderer;
                const params = tooltipRendererParams(id, properties);

                const {
                    closeButton,
                    closeOnClick,
                    anchor,
                    offset,
                    containerClassName: className,
                    maxWidth,
                    ...elementParams
                } = params;

                ReactDOM.render(
                    React.createElement(Tooltip, elementParams),
                    this.tooltipContainer,
                );

                if (this.popup) {
                    this.popup.remove();
                    this.popup = undefined;
                }

                const popupOptions = {
                    closeButton,
                    closeOnClick,
                    anchor,
                    offset,
                    className,
                    maxWidth,
                };

                this.popup = new mapboxgl.Popup(popupOptions)
                    .setLngLat(coordinates)
                    .setDOMContent(this.tooltipContainer);

                this.popup.addTo(map);
            }
        };

        // When the mouse leaves the state-fill layer, update the feature state of the
        // previously hovered feature.
        this.eventHandlers.mouseleave = () => {
            const {
                enableSelection,
                enableHover,
                showToolTipOnHover,
            } = this.props;

            const selectionEnabled = !!onSelectionChange && enableSelection;
            const hoverEnabled = !!onHoverChange && enableHover;

            if (hoverEnabled && this.stateHoveredId) {
                clearHoverState(map, sourceKey, sourceLayer, this.stateHoveredId);
                this.stateHoveredId = undefined;
                onHoverChange(undefined);
            }

            // FIXME: this has problem
            if (hoverEnabled || selectionEnabled || tooltipRenderer || onClick || onDoubleClick) {
                // Change it back to a pointer when it leaves.
                // eslint-disable-next-line no-param-reassign
                map.getCanvas().style.cursor = '';
            }

            if (this.popup && showToolTipOnHover) {
                this.popup.remove();
                this.popup = undefined;
            }
        };

        // When the user moves their mouse over the state-fill layer, we'll update the
        // feature state for the feature under the mouse.
        this.eventHandlers.mousemove = (e) => {
            const { enableHover } = this.props;

            const hoverEnabled = !!onHoverChange && enableHover;

            const { features } = e;
            if (features.length > 0 && hoverEnabled) {
                // Get first feature (it looks to be the top-most)
                const { id } = features[0];

                if (id !== this.stateHoveredId) {
                    changeHoverState(map, sourceKey, sourceLayer, this.stateHoveredId, id);
                    this.stateHoveredId = id;
                    onHoverChange(id);
                }
            }
        };

        // When a click event occurs on a feature in the places layer, open a popup at the
        // location of the feature, with description HTML from its properties.
        this.eventHandlers.click = (e) => {
            const {
                enableSelection,
                selectionOnDoubleClick,
                showToolTipOnDoubleClick,
            } = this.props;
            const selectionEnabled = !!onSelectionChange && enableSelection;

            const {
                lngLat: coordinates,
                features,
            } = e;

            const clickedFeatures = map.queryRenderedFeatures(e.point);
            const topmostClickableFeature = clickedFeatures.find((feature) => {
                const {
                    layer: {
                        metadata,
                    },
                } = feature;
                return metadata && metadata.selectionEnabled;
            });

            // Get first feature (it looks to be the top-most)
            const { id, properties } = features[0];

            if (
                topmostClickableFeature
                && topmostClickableFeature.layer.id === layerKey
                && topmostClickableFeature.source === sourceKey
            ) {
                if (selectionEnabled && !selectionOnDoubleClick) {
                    const index = this.stateSelectedIds.findIndex(selectedId => selectedId === id);

                    let newSelectedIds;
                    if (index === -1) {
                        newSelectedIds = [...this.stateSelectedIds, id];
                    } else {
                        newSelectedIds = [...this.stateSelectedIds];
                        newSelectedIds.splice(index, 1);
                    }

                    changeSelectionState(
                        map, sourceKey, sourceLayer, this.stateSelectedIds, newSelectedIds,
                    );
                    this.stateSelectedIds = newSelectedIds;
                    onSelectionChange(newSelectedIds, id);
                }
            }

            if (tooltipRenderer && !showToolTipOnDoubleClick) {
                const Tooltip = tooltipRenderer;
                const params = tooltipRendererParams(id, properties);

                const {
                    closeButton,
                    closeOnClick,
                    anchor,
                    offset,
                    containerClassName: className,
                    maxWidth,
                    ...elementParams
                } = params;

                ReactDOM.render(
                    React.createElement(Tooltip, elementParams),
                    this.tooltipContainer,
                );

                if (this.popup) {
                    this.popup.remove();
                    this.popup = undefined;
                }

                const popupOptions = {
                    closeButton,
                    closeOnClick,
                    anchor,
                    offset,
                    className,
                    maxWidth,
                };

                this.popup = new mapboxgl.Popup(popupOptions)
                    .setLngLat(coordinates)
                    .setDOMContent(this.tooltipContainer);
                this.popup.addTo(map);
            }

            if (onClick) {
                onClick(id, properties);
            }
        };

        this.eventHandlers.dblclick = (e) => {
            const {
                enableSelection,
                selectionOnDoubleClick,
                showToolTipOnDoubleClick,
            } = this.props;

            const selectionEnabled = !!onSelectionChange && enableSelection;

            const {
                lngLat: coordinates,
                features,
            } = e;

            const clickedFeatures = map.queryRenderedFeatures(e.point);
            const topmostClickableFeature = clickedFeatures.find((feature) => {
                const {
                    layer: {
                        metadata,
                    },
                } = feature;
                return metadata && metadata.selectionEnabled;
            });

            // Get first feature (it looks to be the top-most)
            const { id, properties } = features[0];

            if (
                topmostClickableFeature
                && topmostClickableFeature.layer.id === layerKey
                && topmostClickableFeature.source === sourceKey
            ) {
                if (selectionEnabled && selectionOnDoubleClick) {
                    const index = this.stateSelectedIds.findIndex(selectedId => selectedId === id);

                    let newSelectedIds;
                    if (index === -1) {
                        newSelectedIds = [...this.stateSelectedIds, id];
                    } else {
                        newSelectedIds = [...this.stateSelectedIds];
                        newSelectedIds.splice(index, 1);
                    }

                    changeSelectionState(
                        map, sourceKey, sourceLayer, this.stateSelectedIds, newSelectedIds,
                    );
                    this.stateSelectedIds = newSelectedIds;
                    onSelectionChange(newSelectedIds);
                }
            }

            if (tooltipRenderer && showToolTipOnDoubleClick) {
                const Tooltip = tooltipRenderer;
                const params = tooltipRendererParams(id, properties);

                ReactDOM.render(
                    React.createElement(Tooltip, params),
                    this.tooltipContainer,
                );

                if (this.popup) {
                    this.popup.remove();
                    this.popup = undefined;
                }

                this.popup = new mapboxgl.Popup()
                    .setLngLat(coordinates)
                    .setDOMContent(this.tooltipContainer);
                this.popup.addTo(map);
            }

            if (onDoubleClick) {
                onDoubleClick(id, properties);
            }
        };

        forEach(this.eventHandlers, (eventType, listener) => {
            // console.info('Adding layer event handler', layerKey);
            map.on(eventType, layerKey, listener);
        });

        if (isDefined(hoveredId)) {
            changeHoverState(map, sourceKey, sourceLayer, this.stateHoveredId, hoveredId);
            this.stateHoveredId = hoveredId;
        }

        if (isDefined(selectedIds) && selectedIds.length > 0) {
            changeSelectionState(map, sourceKey, sourceLayer, this.stateSelectedIds, selectedIds);
            this.stateSelectedIds = selectedIds;
        }

        setMapState(
            map, sourceKey, sourceLayer, mapState, selectedIds, hoveredId,
        );

        if (onAnimationKeyframe) {
            this.animationKey = requestAnimationFrame(this.animate);
        }
    }

    animate = (timestamp) => {
        // TODO: handle UNSAFE_componentWillReceiveProps
        const {
            onAnimationKeyframe,
            map,
            layerKey,
        } = this.props;

        const values = onAnimationKeyframe(timestamp);
        if (values) {
            forEach(values, (key, pai) => {
                map.setPaintProperty(layerKey, key, pai);
            });
        }

        this.animationKey = requestAnimationFrame(this.animate);
    }

    render() {
        return null;
    }
}

export default MapChild(MapLayer);
