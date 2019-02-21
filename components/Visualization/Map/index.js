import React from 'react';
import PropTypes from 'prop-types';
import mapboxgl from 'mapbox-gl';
import { _cs } from '@togglecorp/fujs';

import { forEach } from '../../../utils/common';
import Message from '../../View/Message';
import MapContext from './context';
import styles from './styles.scss';


const nullComponent = () => null;

const UNSUPPORTED_BROWSER = !mapboxgl.supported();

const DEFAULT_ZOOM_LEVEL = 3;

const {
    REACT_APP_MAPBOX_ACCESS_TOKEN: TOKEN,
    REACT_APP_MAPBOX_STYLE: DEFAULT_STYLE,
} = process.env;

// Add the mapbox map
if (TOKEN) {
    mapboxgl.accessToken = TOKEN;
}

const WAIT_FOR_RESIZE = 200;
const DEFAULT_CENTER = [84.1240, 28.3949];


const propTypes = {
    className: PropTypes.string,
    bounds: PropTypes.arrayOf(PropTypes.number),
    boundsPadding: PropTypes.number,
    fitBoundsDuration: PropTypes.number,
    panelsRenderer: PropTypes.func,
    children: PropTypes.oneOfType([
        PropTypes.node,
        PropTypes.arrayOf(PropTypes.node),
    ]),
    navControlPosition: PropTypes.string,
    hideNavControl: PropTypes.bool,
    mapStyle: PropTypes.string,
};

const defaultProps = {
    className: '',
    bounds: undefined,
    boundsPadding: 64,
    fitBoundsDuration: 1000,
    panelsRenderer: nullComponent,
    children: false,
    navControlPosition: 'top-left',
    hideNavControl: false,
    mapStyle: DEFAULT_STYLE,
};

export default class Map extends React.Component {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            map: undefined,
            zoomLevel: undefined,
            mapStyle: props.mapStyle,
        };

        this.childDestroyers = {};
        this.mapContainerRef = React.createRef();
    }

    componentDidMount() {
        this.mounted = true;
        if (UNSUPPORTED_BROWSER) {
            return;
        }

        const {
            navControlPosition,
            hideNavControl,
            mapStyle: mapStyleFromProps,
        } = this.props;

        const { current: mapContainer } = this.mapContainerRef;

        const map = new mapboxgl.Map({
            container: mapContainer,
            style: mapStyleFromProps,
            zoom: DEFAULT_ZOOM_LEVEL,
            center: DEFAULT_CENTER,
            minZoom: 3,
            maxZoom: 10,
            logoPosition: 'bottom-right',
            doubleClickZoom: false,
            preserveDrawingBuffer: true,
        });

        if (!hideNavControl) {
            // NOTE: do we need to remove control on unmount?
            map.addControl(
                new mapboxgl.NavigationControl(),
                navControlPosition,
            );
        }

        map.on('load', () => this.handleLoad(map));
        map.on('zoom', () => this.handleZoom(map));
        map.on(
            'style.load',
            (event) => {
                const mapStyle = event.style.stylesheet.sprite;
                this.setState({ mapStyle });
            },
        );

        // NOTE: sometimes the map doesn't take the full width
        this.resizeTimeout = setTimeout(
            () => map.resize(),
            WAIT_FOR_RESIZE,
        );
    }

    componentWillReceiveProps(nextProps) {
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

        if (oldBounds !== newBounds) {
            this.setBounds(map, newBounds, boundsPadding, fitBoundsDuration);
        }

        if (oldMapStyle !== newMapStyle && newMapStyle && map) {
            map.setStyle(newMapStyle);
            // NOTE: removing child destroyers
            this.childDestroyers = {};
        }
    }

    componentWillUnmount() {
        this.mounted = false;
        if (UNSUPPORTED_BROWSER) {
            return;
        }

        clearTimeout(this.resizeTimeout);

        forEach(this.childDestroyers, (key, childDestroyer) => {
            childDestroyer();
        });

        const { map } = this.state;
        if (map) {
            map.remove();
        }
    }

    setChildDestroyer = (key, destroyer) => {
        this.childDestroyers[key] = destroyer;
    }

    setBounds = (map, bounds, padding, duration) => {
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

    handleLoad = (map) => {
        // Since the map is loaded asynchronously, make sure
        // we are still mounted before doing setState
        if (!this.mounted) {
            return;
        }

        const {
            bounds,
            boundsPadding,
            fitBoundsDuration,
        } = this.props;

        this.setBounds(map, bounds, boundsPadding, fitBoundsDuration);
        this.setState({ map, zoomLevel: DEFAULT_ZOOM_LEVEL });
    }

    handleZoom = (map) => {
        this.setState({
            zoomLevel: map.getZoom(),
        });
    }

    render() {
        const {
            panelsRenderer,
            className: classNameFromProps,
            children,
        } = this.props;
        const {
            map,
            zoomLevel,
            mapStyle,
        } = this.state;

        const className = _cs(
            classNameFromProps,
            styles.map,
        );

        if (UNSUPPORTED_BROWSER) {
            return (
                <div className={className}>
                    <Message>
                        {'Your browser doesn\'t support Mapbox!'}
                    </Message>
                    {children}
                </div>
            );
        }

        const Panels = panelsRenderer;

        const childrenProps = {
            map,
            zoomLevel,
            setDestroyer: this.setChildDestroyer,
            mapStyle,
        };

        return (
            <div
                className={className}
                ref={this.mapContainerRef}
            >
                <MapContext.Provider value={childrenProps}>
                    {children}
                </MapContext.Provider>
                <div className={styles.leftBottomPanels}>
                    <Panels
                        map={map}
                        zoomLevel={zoomLevel}
                    />
                </div>
            </div>
        );
    }
}
