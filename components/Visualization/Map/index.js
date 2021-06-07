import React from 'react';
import PropTypes from 'prop-types';
import mapboxgl from 'mapbox-gl';

import { forEach } from '../../../utils/common';
import MapContext from './context';

const UNSUPPORTED_BROWSER = !mapboxgl.supported();
const DEFAULT_ZOOM_LEVEL = 3;
const DEFAULT_CENTER = [84.1240, 28.3949];
const DEFAULT_BOUNDS = [
    80.05858661752784, 26.347836996368667,
    88.20166918432409, 30.44702867091792,
];
// const PADDING = 20;
/*
const DEFAULT_MAX_BOUNDS = [
    [80.05858661752784 - PADDING, 26.347836996368667 - PADDING],
    [88.20166918432409 + PADDING, 30.44702867091792 + PADDING],
];
*/
const WAIT_FOR_RESIZE = 200;

const {
    REACT_APP_MAPBOX_ACCESS_TOKEN: TOKEN,
    REACT_APP_MAPBOX_STYLE: DEFAULT_STYLE,
} = process.env;

// Add the mapbox map
if (TOKEN) {
    mapboxgl.accessToken = TOKEN;
}

const propTypes = {
    bounds: PropTypes.arrayOf(PropTypes.number),
    boundsPadding: PropTypes.number,
    fitBoundsDuration: PropTypes.number,
    children: PropTypes.oneOfType([
        PropTypes.node,
        PropTypes.arrayOf(PropTypes.node),
    ]),
    logoPosition: PropTypes.string,
    navControlPosition: PropTypes.string,
    geoControlPosition: PropTypes.string,
    scaleControlPosition: PropTypes.string,
    locateOnStartup: PropTypes.bool,
    showNavControl: PropTypes.bool,
    showGeolocationControl: PropTypes.bool,
    showScaleControl: PropTypes.bool,
    mapStyle: PropTypes.string,
    zoom: PropTypes.number,
    center: PropTypes.arrayOf(PropTypes.number),
    minZoom: PropTypes.number,
    maxZoom: PropTypes.number,

    navOptions: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    geoOptions: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    scaleOptions: PropTypes.object, // eslint-disable-line react/forbid-prop-types

    onGeolocationChange: PropTypes.func,

    maxBounds: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
    onClick: PropTypes.func,
    enableDoubleClickZoom: PropTypes.bool,
};

const defaultProps = {
    children: undefined,

    bounds: DEFAULT_BOUNDS,
    boundsPadding: 64,
    fitBoundsDuration: 1000,

    logoPosition: 'bottom-right',
    navControlPosition: 'bottom-right',
    geoControlPosition: 'bottom-right',
    scaleControlPosition: 'bottom-right',
    showNavControl: false,
    showGeolocationControl: false,
    showScaleControl: false,
    locateOnStartup: false,

    mapStyle: DEFAULT_STYLE,
    zoom: DEFAULT_ZOOM_LEVEL,
    center: DEFAULT_CENTER,
    minZoom: undefined,
    maxZoom: undefined,

    maxBounds: undefined,

    navOptions: undefined,
    geoOptions: undefined,
    scaleOptions: undefined,
    onGeolocationChange: undefined,
    onClick: undefined,

    enableDoubleClickZoom: false,

    // maxBounds: DEFAULT_MAX_BOUNDS,
};

export default class Map extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            map: undefined,
            zoomLevel: undefined,
            mapStyle: props.mapStyle,
        };

        this.mounted = false;
        this.sourceDestroyers = {};
        this.mapContainerRef = React.createRef();
    }

    componentDidMount() {
        this.mounted = true;
        if (UNSUPPORTED_BROWSER) {
            return;
        }

        const {
            mapStyle: mapStyleFromProps,
            zoom,
            center,
            minZoom,
            maxZoom,
            maxBounds,

            navOptions,
            navControlPosition,
            showNavControl,

            locateOnStartup,
            geoOptions,
            geoControlPosition,
            showGeolocationControl,
            onGeolocationChange,

            scaleOptions,
            scaleControlPosition,
            showScaleControl,

            logoPosition,
            onClick,
            enableDoubleClickZoom,
        } = this.props;

        const { current: mapContainer } = this.mapContainerRef;

        const map = new mapboxgl.Map({
            container: mapContainer,
            style: mapStyleFromProps,

            zoom,
            center,
            minZoom,
            maxZoom,
            maxBounds,

            logoPosition,
            doubleClickZoom: enableDoubleClickZoom,
            preserveDrawingBuffer: true,
        });

        if (onClick) {
            map.on('click', onClick);
        }

        if (showScaleControl) {
            const scale = new mapboxgl.ScaleControl(scaleOptions);
            map.addControl(scale, scaleControlPosition);
        }

        if (showNavControl) {
            // NOTE: don't we need to remove control on unmount?
            const nav = new mapboxgl.NavigationControl(navOptions);
            map.addControl(
                nav,
                navControlPosition,
            );
        }

        let geolocate;
        if (showGeolocationControl) {
            // NOTE: don't we need to remove control on unmount?
            geolocate = new mapboxgl.GeolocateControl(geoOptions);
            map.addControl(
                geolocate,
                geoControlPosition,
            );
            geolocate.on('geolocate', onGeolocationChange);
        }

        map.on('load', () => this.handleLoad(map, locateOnStartup, geolocate));
        map.on('zoom', () => this.handleZoomChange(map));
        map.on(
            'style.load',
            (event) => {
                const mapStyle = event.style.stylesheet.sprite;
                // console.info('Style has changed to', mapStyle);
                this.setState({ mapStyle });
            },
        );

        // NOTE: sometimes the map doesn't take the full width
        this.resizeTimeout = setTimeout(
            () => map.resize(),
            WAIT_FOR_RESIZE,
        );
    }

    // eslint-disable-next-line camelcase
    UNSAFE_componentWillReceiveProps(nextProps) {
        if (UNSUPPORTED_BROWSER) {
            return;
        }

        const { map } = this.state;

        const {
            bounds: oldBounds,
            mapStyle: oldMapStyle,
        } = this.props;

        const {
            bounds: newBounds,
            mapStyle: newMapStyle,
            boundsPadding,
            fitBoundsDuration,
        } = nextProps;

        if (oldMapStyle !== newMapStyle && newMapStyle && map) {
            // console.info('New style from props', newMapStyle);
            this.destroySources();
            map.setStyle(newMapStyle);
            return;
        }
        if (oldBounds !== newBounds) {
            this.handleBoundChange(map, newBounds, boundsPadding, fitBoundsDuration);
        }
    }

    componentWillUnmount() {
        this.mounted = false;

        if (UNSUPPORTED_BROWSER) {
            return;
        }

        clearTimeout(this.resizeTimeout);

        this.destroySources();

        const { map } = this.state;
        if (map) {
            map.remove();
        }
    }

    setSourceDestroyer = (key, destroyer) => {
        this.sourceDestroyers[key] = destroyer;
    }

    destroySources = () => {
        // console.info('EXTERNAL map removal');
        forEach(this.sourceDestroyers, (key, sourceDestroyer) => {
            // console.info('EXTERNAL source removal', key);
            sourceDestroyer();
        });
        // this.sourceDestroyers = {};
    }

    handleLoad = (map, locateOnStartup, geolocate) => {
        // Since the map is loaded asynchronously, make sure
        // we are still mounted before doing setState
        if (!this.mounted) {
            return;
        }

        const {
            bounds,
            boundsPadding,
            fitBoundsDuration,
            zoom,
        } = this.props;

        this.handleBoundChange(map, bounds, boundsPadding, fitBoundsDuration);

        this.setState({
            map,
            zoomLevel: zoom,
        });

        if (geolocate && locateOnStartup) {
            geolocate.trigger();
        }
    }

    handleBoundChange = (map, bounds, padding, duration) => {
        if (!map || !bounds) {
            return;
        }
        const [fooLon, fooLat, barLon, barLat] = bounds;
        map.fitBounds(
            [[fooLon, fooLat], [barLon, barLat]],
            {
                padding,
                duration,
            },
        );
    }

    handleZoomChange = (map) => {
        this.setState({ zoomLevel: map.getZoom() });
    }

    render() {
        const {
            children,
        } = this.props;
        const {
            map,
            zoomLevel,
            mapStyle,
        } = this.state;

        if (UNSUPPORTED_BROWSER) {
            console.warn('Your brower does not support Mapbox!');
            return children;
        }

        const childrenProps = {
            map,
            zoomLevel,
            mapStyle,
            mapContainerRef: this.mapContainerRef,
            setDestroyer: this.setSourceDestroyer,
        };

        return (
            <MapContext.Provider value={childrenProps}>
                {children}
            </MapContext.Provider>
        );
    }
}
