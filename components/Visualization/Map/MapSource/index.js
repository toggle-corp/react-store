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
    supportHover: PropTypes.bool,
    setDestroyer: PropTypes.func,
    // eslint-disable-next-line react/forbid-prop-types
    geoJson: PropTypes.object.isRequired,
    mapStyle: PropTypes.string.isRequired,
    bounds: PropTypes.arrayOf(PropTypes.number),
};

const defaultProps = {
    map: undefined,
    zoomLevel: undefined,
    children: false,
    onSourceAdded: undefined,
    onSourceRemoved: undefined,
    supportHover: false,
    setDestroyer: undefined,
    bounds: undefined,
};


@MapChild
export default class MapSource extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        if (props.setDestroyer) {
            props.setDestroyer(props.sourceKey, this.destroy);
        }

        this.layerDestroyers = {};
        this.source = undefined;
        this.hoverSource = undefined;
    }

    componentDidMount() {
        this.create(this.props);
    }

    componentWillReceiveProps(nextProps) {
        const {
            map: oldMap,
            mapStyle: oldMapStyle,
            geoJson: oldGeoJson,
            bounds: oldBounds,
        } = this.props;
        const {
            map: newMap,
            mapStyle: newMapStyle,
            geoJson: newGeoJson,
            bounds: newBounds,
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
        if (oldBounds !== newBounds && newBounds) {
            newMap.fitBounds(newBounds);
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
            console.warn('EXTERNAL layer removal', key);
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
            console.info('Removing source', this.props.sourceKey);
            map.removeSource(this.source);
            this.source = undefined;
        }
        if (this.hoverSource) {
            console.info('Removing hover source', this.props.sourceKey);
            map.removeSource(this.hoverSource);
            this.hoverSource = undefined;
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
            onSourceAdded,
            supportHover,
            bounds,
        } = props;

        console.info('Adding source', this.props.sourceKey);
        map.addSource(sourceKey, {
            type: 'geojson',
            data: geoJson,
        });

        if (bounds) {
            map.fitBounds(bounds);
        }

        this.source = sourceKey;

        if (supportHover) {
            console.info('Adding hover source', this.props.sourceKey);
            map.addSource(`${sourceKey}-hover`, {
                type: 'geojson',
                data: geoJson,
            });
            this.hoverSource = `${sourceKey}-hover`;
        }

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
