import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import mapboxgl from 'mapbox-gl';
import MapChild from '../MapChild';
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
    }

    componentDidMount() {
        this.create(this.props);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.map !== nextProps.map) {
            this.destroy();
            this.create(nextProps);
        } else if (this.layer) {
            if (this.props.layout !== nextProps.layout) {
                this.reloadLayout(nextProps);
            }
            if (this.props.paint !== nextProps.paint) {
                this.reloadPaint(nextProps);
            }
            if (this.props.filter !== nextProps.filter) {
                this.reloadFilter(nextProps);
            }
        }
    }

    componentWillUnmount() {
        this.destroy();
    }

    eventHandlers = {};

    destroy = () => {
        const { map, layerKey } = this.props;
        if (map) {
            Object.keys(this.eventHandlers).forEach((type) => {
                const listener = this.eventHandlers[type];
                map.off(type, layerKey, listener);
            });
            if (this.layer) {
                map.removeLayer(this.layer);
            }
            if (this.hoverLayer) {
                map.removeLayer(this.hoverLayer);
            }
            if (this.popup) {
                this.popup.remove();
            }
        }
        this.layer = undefined;
        this.hoverLayer = undefined;
        this.popup = undefined;
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

        if (onClick) {
            this.eventHandlers.click = (e) => {
                const feature = e.features[0];
                onClick(feature.properties[property]);
            };
        }

        this.createHoverLayer(props);

        Object.keys(this.eventHandlers).forEach((eventType) => {
            const listener = this.eventHandlers[eventType];
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

    reloadLayout = (props) => {
        const {
            map,
            layerKey,
            layout,
        } = props;

        Object.keys(layout).forEach((key) => {
            map.setLayoutProperty(layerKey, key, layout[key]);
        });
    }

    reloadPaint = (props) => {
        const {
            map,
            layerKey,
            paint,
        } = props;

        Object.keys(paint).forEach((key) => {
            map.setPaintProperty(layerKey, key, paint[key]);
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

    renderTooltip = (properties) => {
        const { hoverInfo: { tooltipProperty, tooltipModifier } } = this.props;

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
