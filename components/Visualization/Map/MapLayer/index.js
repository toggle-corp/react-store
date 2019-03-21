import React from 'react';
import PropTypes from 'prop-types';
import mapboxgl from 'mapbox-gl';
import ReactDOM from 'react-dom';

import MapChild from '../MapChild';
import { forEach } from '../../../../utils/common';

import styles from './styles.scss';

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

    // eslint-disable-next-line react/no-unused-prop-types
    onClick: PropTypes.func,

    setDestroyer: PropTypes.func,
    mapStyle: PropTypes.string.isRequired,
};

const defaultProps = {
    layout: undefined,
    filter: undefined,
    onClick: undefined,
    setDestroyer: undefined,
};


@MapChild
export default class MapLayer extends React.PureComponent {
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

    componentWillReceiveProps(nextProps) {
        const {
            map: oldMap,
            mapStyle: oldMapStyle,
            layout: oldLayout,
            paint: oldPaint,
            filter: oldFilter,
        } = this.props;
        const {
            map: newMap,
            mapStyle: newMapStyle,
            layout: newLayout,
            paint: newPaint,
            filter: newFilter,
        } = nextProps;

        if (oldMap !== newMap || oldMapStyle !== newMapStyle) {
            this.destroy();
            this.create(nextProps);
            return;
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
            console.info('Removing layer event handler', layerKey);
            map.off(type, layerKey, listener);
        });
        this.eventHandlers = {};
    }

    destroy = () => {
        const { map, layerKey } = this.props;
        if (!map) {
            return;
        }

        this.destroyHandlers(map, layerKey);

        if (this.layer) {
            console.info('Removing layer', layerKey);
            map.removeLayer(this.layer);
            this.layer = undefined;
        }
        if (this.popup) {
            console.info('Removing popup layer', layerKey);
            this.popup.remove();
            this.popup = undefined;
        }
    }

    create = (props) => {
        const {
            map,
            sourceKey,
            layerKey,
            type,
            paint,
            layout,
            filter,
            enableHover,
            tooltipRenderer,
            tooltipRendererParams,
            onClick,
        } = props;

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
        console.info('Adding layer', layerKey);
        map.addLayer(layerInfo);

        this.layer = layerKey;

        let hoveredStateId;

        // Change the cursor to a pointer when the mouse is over the places layer.
        this.eventHandlers.mouseenter = () => {
            if (enableHover || tooltipRenderer) {
                // eslint-disable-next-line no-param-reassign
                map.getCanvas().style.cursor = 'pointer';
            }
        };

        // When the user moves their mouse over the state-fill layer, we'll update the
        // feature state for the feature under the mouse.
        this.eventHandlers.mousemove = (e) => {
            const { features } = e;
            if (features.length > 0 && enableHover) {
                if (hoveredStateId) {
                    map.setFeatureState(
                        { source: sourceKey, id: hoveredStateId },
                        { hover: false },
                    );
                }
                const [
                    { id },
                ] = features;
                hoveredStateId = id;
                map.setFeatureState(
                    { source: sourceKey, id: hoveredStateId },
                    { hover: true },
                );
            }
        };

        // When a click event occurs on a feature in the places layer, open a popup at the
        // location of the feature, with description HTML from its properties.
        this.eventHandlers.click = (e) => {
            const {
                lngLat: coordinates,
                features: [
                    { id, properties },
                ],
            } = e;

            if (tooltipRenderer) {
                const Tooltip = tooltipRenderer;
                const params = tooltipRendererParams(id, properties);

                ReactDOM.render(
                    React.createElement(Tooltip, params),
                    this.tooltipContainer,
                );

                this.popup = new mapboxgl.Popup()
                    .setLngLat(coordinates)
                    .setDOMContent(this.tooltipContainer);

                this.popup.addTo(map);
            }

            if (onClick) {
                onClick(id, properties);
            }
        };

        // When the mouse leaves the state-fill layer, update the feature state of the
        // previously hovered feature.
        this.eventHandlers.mouseleave = () => {
            if (enableHover) {
                if (hoveredStateId) {
                    map.setFeatureState(
                        { source: sourceKey, id: hoveredStateId },
                        { hover: false },
                    );
                }
                hoveredStateId = undefined;
            }

            if (enableHover || tooltipRenderer) {
                // Change it back to a pointer when it leaves.
                // eslint-disable-next-line no-param-reassign
                map.getCanvas().style.cursor = '';
            }
        };

        forEach(this.eventHandlers, (eventType, listener) => {
            console.info('Adding layer event handler', layerKey);
            map.on(eventType, layerKey, listener);
        });
    }

    render() {
        return null;
    }
}
