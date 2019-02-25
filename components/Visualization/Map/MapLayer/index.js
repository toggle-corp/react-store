import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import mapboxgl from 'mapbox-gl';

import MapChild from '../MapChild';
import { forEach } from '../../../../utils/common';

import styles from './styles.scss';

const renderInto = (container, component) => {
    ReactDOM.render(component, container);
};


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
    property: PropTypes.string,

    hoverInfo: PropTypes.shape({
        paint: PropTypes.object,
        showTooltip: PropTypes.bool,
        tooltipProperty: PropTypes.string,
        tooltipModifier: PropTypes.func,

        onMouseOver: PropTypes.func,
    }),

    // eslint-disable-next-line react/no-unused-prop-types
    onClick: PropTypes.func,

    setDestroyer: PropTypes.func,
    mapStyle: PropTypes.string.isRequired,
};

const defaultProps = {
    layout: undefined,
    filter: undefined,
    property: undefined,
    hoverInfo: undefined,
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
        this.hoverLayer = undefined;
        this.popup = undefined;
    }

    componentDidMount() {
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
        } = this.props;

        if (oldMap !== newMap || oldMapStyle !== newMapStyle) {
            this.destroy();
            this.create(nextProps);
        } else if (this.layer && oldLayout !== newLayout) {
            this.reloadLayout(nextProps);
        } else if (this.layer && oldPaint !== newPaint) {
            this.reloadPaint(nextProps);
        } else if (this.layer && oldFilter !== newFilter) {
            this.reloadFilter(nextProps);
        }
    }

    componentWillUnmount() {
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
            map.removeLayer(this.layer);
            this.layer = undefined;
        }
        if (this.hoverLayer) {
            map.removeLayer(this.hoverLayer);
            this.hoverLayer = undefined;
        }
        if (this.popup) {
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
            onClick,
            property,
            bounds,
        } = props;

        const layerInfo = {
            id: layerKey,
            source: sourceKey,
            type,
            paint,
        };
        if (layout) {
            layerInfo.layout = layout;
        }
        if (filter) {
            layerInfo.filter = filter;
        }
        map.addLayer(layerInfo);

        this.layer = layerKey;

        // FIXME: this need refactoring
        this.createHoverLayer(props);

        if (onClick) {
            this.eventHandlers.click = (e) => {
                const [feature] = e.features;
                onClick(feature.properties[property]);
            };
        }

        forEach(this.eventHandlers, (eventType, listener) => {
            map.on(eventType, layerKey, listener);
        });
    }

    createHoverLayer = ({
        map,
        sourceKey,
        layerKey,
        property,
        type,
        hoverInfo,
    }) => {
        if (!hoverInfo) {
            return;
        }
        const hoverLayerKey = `${layerKey}-hover`;

        const {
            onMouseOver,
            paint,
            showTooltip,
        } = hoverInfo;

        map.addLayer({
            id: hoverLayerKey,
            source: sourceKey,
            type,
            paint,
            filter: ['==', property, ''],
        });

        this.hoverLayer = hoverLayerKey;

        let popup;
        let tooltipContainer;

        if (showTooltip) {
            tooltipContainer = document.createElement('div');
            popup = new mapboxgl.Marker(tooltipContainer, {
                offset: [0, -10],
            }).setLngLat([0, 0]);
            this.popup = popup;

            map.on('zoom', (e) => {
                if (e.originalEvent && this.popup) {
                    this.popup.setLngLat(map.unproject([
                        e.originalEvent.offsetX,
                        e.originalEvent.offsetY - 8,
                    ]));
                }
            });
        }

        this.eventHandlers.mouseenter = (e) => {
            const feature = e.features[0];
            if (popup) {
                popup.addTo(map);
                renderInto(tooltipContainer, this.renderTooltip(feature.properties));
                popup.setOffset([0, -tooltipContainer.clientHeight / 2]);
            }

            if (onMouseOver) {
                const propertyValue = feature.properties[property];
                this.lastHoverValue = propertyValue;
                onMouseOver(feature.properties);
            }
        };

        this.eventHandlers.mousemove = (e) => {
            const feature = e.features[0];
            const propertyValue = feature.properties[property];
            map.setFilter(hoverLayerKey, ['==', property, propertyValue]);
            // eslint-disable-next-line no-param-reassign
            map.getCanvas().style.cursor = 'pointer';

            if (popup) {
                popup.setLngLat(map.unproject([
                    e.point.x,
                    e.point.y - 8,
                ]));
                renderInto(tooltipContainer, this.renderTooltip(feature.properties));
                popup.setOffset([0, -tooltipContainer.clientHeight / 2]);
            }

            if (onMouseOver && this.lastHoverValue !== propertyValue) {
                this.lastHoverValue = propertyValue;
                onMouseOver(feature.properties);
            }
        };

        this.eventHandlers.mouseleave = () => {
            map.setFilter(hoverLayerKey, ['==', property, '']);
            // eslint-disable-next-line no-param-reassign
            map.getCanvas().style.cursor = '';

            if (popup) {
                popup.remove();
            }

            if (onMouseOver) {
                onMouseOver(undefined);
            }
        };
    }

    renderTooltip = (properties) => {
        const {
            hoverInfo: {
                tooltipProperty,
                tooltipModifier,
            },
        } = this.props;

        if (tooltipModifier) {
            return tooltipModifier(properties);
        }

        return (
            <div className={styles.tooltip}>
                { properties[tooltipProperty] }
            </div>
        );
    }

    render() {
        return null;
    }
}
