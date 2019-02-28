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
const DEFAULT_CENTER = [84.1240, 28.3949];
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
    defaultZoomLevel: PropTypes.number.isRequired,
    defaultCenter: PropTypes.arrayOf(PropTypes.number),
};

const defaultProps = {
    panelsRenderer: nullComponent,

    className: '',
    children: undefined,

    bounds: undefined,
    boundsPadding: 64,
    fitBoundsDuration: 1000,

    navControlPosition: 'top-left',
    hideNavControl: false,

    mapStyle: DEFAULT_STYLE,
    defaultZoomLevel: DEFAULT_ZOOM_LEVEL,
    defaultCenter: DEFAULT_CENTER,
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
            navControlPosition,
            hideNavControl,
            mapStyle: mapStyleFromProps,
            defaultZoomLevel,
            defaultCenter,
        } = this.props;

        const { current: mapContainer } = this.mapContainerRef;

        const map = new mapboxgl.Map({
            container: mapContainer,
            style: mapStyleFromProps,
            zoom: defaultZoomLevel,
            center: defaultCenter,
            minZoom: 3,
            maxZoom: 13,
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
        map.on('zoom', () => this.handleZoomChange(map));
        map.on(
            'style.load',
            (event) => {
                const mapStyle = event.style.stylesheet.sprite;
                console.info('Style has changed to', mapStyle);
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

        if (oldMapStyle !== newMapStyle && newMapStyle && map) {
            console.info('New style from props', newMapStyle);
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
        console.info('EXTERNAL map removal');
        forEach(this.sourceDestroyers, (key, sourceDestroyer) => {
            console.info('EXTERNAL source removal', key);
            sourceDestroyer();
        });
        // this.sourceDestroyers = {};
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
            defaultZoomLevel,
        } = this.props;

        this.handleBoundChange(map, bounds, boundsPadding, fitBoundsDuration);

        this.setState({
            map,
            zoomLevel: defaultZoomLevel,
        });
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
            setDestroyer: this.setSourceDestroyer,
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
