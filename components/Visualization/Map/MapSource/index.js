import React from 'react';
import PropTypes from 'prop-types';
import MapContext from '../context';
import MapChild from '../MapChild';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    map: PropTypes.object,
    zoomLevel: PropTypes.number,
    children: PropTypes.oneOfType([
        PropTypes.node,
        PropTypes.arrayOf(PropTypes.node),
    ]),
    // eslint-disable-next-line react/no-unused-prop-types
    sourceKey: PropTypes.string.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    onSourceAdded: PropTypes.func,
    onSourceRemoved: PropTypes.func,
    // eslint-disable-next-line react/no-unused-prop-types
    setDestroyer: PropTypes.func,
    // eslint-disable-next-line react/forbid-prop-types
    geoJson: PropTypes.object,
    // eslint-disable-next-line react/forbid-prop-types, react/no-unused-prop-types
    url: PropTypes.string,
    // eslint-disable-next-line react/forbid-prop-types, react/no-unused-prop-types
    rasterTiles: PropTypes.arrayOf(PropTypes.string),
    mapStyle: PropTypes.string.isRequired,
    bounds: PropTypes.arrayOf(PropTypes.number),
    boundsPadding: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
    // eslint-disable-next-line react/forbid-prop-types, react/no-unused-prop-types
    images: PropTypes.array,
};

const defaultProps = {
    map: undefined,
    zoomLevel: undefined,
    children: false,
    onSourceAdded: undefined,
    onSourceRemoved: undefined,
    setDestroyer: undefined,
    bounds: undefined,
    boundsPadding: 64,
    images: undefined,
    geoJson: undefined,
    url: undefined,
    rasterTiles: undefined,
};

class MapSource extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        if (props.setDestroyer) {
            props.setDestroyer(props.sourceKey, this.destroy);
        }

        this.layerDestroyers = {};
        this.source = undefined;
    }

    componentDidMount() {
        this.create(this.props);
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        const {
            map: oldMap,
            mapStyle: oldMapStyle,
            geoJson: oldGeoJson,
            bounds: oldBounds,
            boundsPadding: oldPadding,
        } = this.props;
        const {
            map: newMap,
            mapStyle: newMapStyle,
            geoJson: newGeoJson,
            bounds: newBounds,
            boundsPadding: newPadding,
        } = nextProps;

        if (oldMap !== newMap || oldMapStyle !== newMapStyle) {
            this.destroy();
            this.create(nextProps);
            return;
        }

        if (this.source && newMap && oldGeoJson !== newGeoJson) {
            newMap
                .getSource(this.source)
                .setData(newGeoJson);
        }

        if (newBounds && (oldBounds !== newBounds || oldPadding !== newPadding)) {
            newMap.fitBounds(newBounds, { padding: newPadding });
        }
    }

    componentWillUnmount() {
        this.destroy();
    }

    setLayerDestroyer = (key, destroyer) => {
        this.layerDestroyers[key] = destroyer;
    }

    destroyLayers = () => {
        Object.keys(this.layerDestroyers).forEach((key) => {
            // console.info('EXTERNAL layer removal', key);
            this.layerDestroyers[key]();
        });
        // this.layerDestroyers = {};
    }

    destroy = () => {
        const {
            map,
            onSourceRemoved,
        } = this.props;

        if (!map) {
            return;
        }

        this.destroyLayers();

        if (this.source) {
            // console.info('Removing source', this.props.sourceKey);
            map.removeSource(this.source);
            this.source = undefined;
        }
        if (onSourceRemoved) {
            onSourceRemoved();
        }
    }

    create = (props) => {
        const {
            map,
            sourceKey,
            geoJson,
            url,
            rasterTiles,
            onSourceAdded,
            bounds,
            boundsPadding,
            images,
            cluster,
            clusterMaxZoom,
            clusterRadius,
        } = props;

        if (images) {
            // FIXME: namespace image with source
            // FIXME: remove image on component unmount
            images.forEach(({ name, icon, ...otherProps }) => {
                if (map.hasImage(name)) {
                    return;
                }

                const img = new Image(10, 10);
                img.onload = () => {
                    map.addImage(name, img, otherProps);
                };
                img.src = icon;
            });
        }

        const properties = {};

        // console.info('Adding source', this.props.sourceKey);
        if (geoJson) {
            properties.type = 'geojson';
            properties.data = geoJson;
        } else if (url) {
            properties.type = 'vector';
            properties.url = url;
        } else if (rasterTiles) {
            properties.type = 'raster';
            properties.tiles = rasterTiles;
            properties.tileSize = 256;
        }

        if (cluster) {
            properties.cluster = cluster;
        }

        if (clusterMaxZoom) {
            properties.clusterMaxZoom = clusterMaxZoom;
        }

        if (clusterRadius) {
            properties.clusterRadius = clusterRadius;
        }

        // NOTE: Inject properties for source

        map.addSource(sourceKey, properties);

        if (bounds) {
            setTimeout(() => {
                map.fitBounds(bounds, { padding: boundsPadding });
            }, 1000);
        }

        this.source = sourceKey;

        if (onSourceAdded) {
            onSourceAdded();
        }

        // change in this.source needs to re-render
        this.forceUpdate();
    }

    render() {
        if (!this.source) {
            return null;
        }

        const {
            map,
            zoomLevel,
            sourceKey,
            children,
            mapStyle,
        } = this.props;

        const childrenProps = {
            map,
            zoomLevel,
            sourceKey,
            setDestroyer: this.setLayerDestroyer,
            mapStyle,
        };

        return (
            <MapContext.Provider value={childrenProps}>
                {children}
            </MapContext.Provider>
        );
    }
}

export default MapChild(MapSource);
