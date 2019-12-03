import React from 'react';
import PropTypes from 'prop-types';
import { getDifferenceInDays } from '@togglecorp/fujs';
import mapboxgl from 'mapbox-gl';

import LoadingAnimation from '../../View/LoadingAnimation';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    geoLocations: PropTypes.arrayOf(PropTypes.shape({
        key: PropTypes.string,
        title: PropTypes.string,
        geoJson: PropTypes.object,
    })),
    geoPoints: PropTypes.arrayOf(PropTypes.shape({
        coordinates: PropTypes.arrayOf(PropTypes.number),
        title: PropTypes.string,
        date: PropTypes.string,
    })),
    loading: PropTypes.bool,
};

const defaultProps = {
    className: '',
    geoLocations: [],
    geoPoints: [],
    loading: false,
};

export default class GeoReferencedMap extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {
            pendingMap: true,
        };
    }

    componentDidMount() {
        const {
            geoLocations,
            geoPoints,
        } = this.props;
        this.mounted = true;
        mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

        const map = new mapboxgl.Map({
            center: [50, 10],
            container: this.mapContainer,
            style: process.env.REACT_APP_MAPBOX_STYLE,
            zoom: 2,
            scrollZoom: false,
        });

        map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

        map.on('load', () => {
            if (!this.mounted) {
                return;
            }
            this.map = map;
            this.loadGeoRegions(geoLocations);
            this.loadGeoPoints(geoPoints);
            this.setState({ pendingMap: false });
        });

        const popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
        });

        map.on('mousemove', 'region-layer', (e) => {
            const feature = e.features[0];
            map.getCanvas().style.cursor = 'pointer';
            popup.setLngLat([
                e.lngLat.lng,
                e.lngLat.lat + 0.1,
            ]).setHTML(feature.properties.name);
        });

        map.on('mouseenter', 'region-layer', (e) => {
            const feature = e.features[0];
            popup
                .setHTML(feature.properties.name)
                .addTo(map);
        });

        map.on('mouseleave', 'region-layer', () => {
            map.getCanvas().style.cursor = '';

            popup.remove();
        });

        map.on('mouseenter', 'unclustered-point-circle', (e) => {
            const feature = e.features[0];
            map.getCanvas().style.cursor = 'pointer';
            popup
                .setLngLat(feature.geometry.coordinates)
                .setHTML(feature.properties.title)
                .addTo(map);
        });

        map.on('mouseleave', 'unclustered-point-circle', () => {
            map.getCanvas().style.cursor = '';
            popup.remove();
        });

        window.addEventListener('keydown', this.handleCtrlDown);
        window.addEventListener('keyup', this.handleCtrlUp);
        window.addEventListener('wheel', this.handleScroll);
        this.mapResizeTimeout = setTimeout(() => { map.resize(); }, 900);
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        const {
            geoLocations,
            geoPoints,
        } = this.props;

        if (geoLocations !== nextProps.geoLocations) {
            this.loadGeoRegions(nextProps.geoLocations);
        }
        if (geoPoints !== nextProps.geoPoints) {
            this.loadGeoPoints(nextProps.geoPoints);
        }
    }

    componentWillUnmount() {
        if (this.map) {
            this.map.removeLayer('region-layer');
            this.map.removeLayer('points-layer');
            this.map.removeLayer('clustered-point-symbol');
            this.map.removeLayer('unclustered-point-symbol');
            this.map.removeLayer('unclustered-point-circle');
            this.map.removeSource('geojson');
            this.map.remove();
            this.map = undefined;
        }
        this.mounted = false;

        window.removeEventListener('keyup', this.handleCtrlUp);
        window.removeEventListener('keydown', this.handleCtrlDown);
        window.removeEventListener('wheel', this.handleScroll);
        clearTimeout(this.mapResizeTimeout);
        clearTimeout(this.mapOverlayTimeout);
    }

    getColorForMarker = (date) => {
        const today = new Date();
        const daysDifference = getDifferenceInDays(today, new Date(date));
        if (daysDifference < 30) {
            return '#fbb4b9';
        }
        if (daysDifference < 180) {
            return '#f768a1';
        }
        return '#ae017e';
    }

    addPointsLayers = () => {
        this.map.addLayer({
            id: 'points-layer',
            type: 'circle',
            source: 'points',
            filter: ['has', 'point_count'],
            paint: {
                'circle-color': [
                    'step',
                    ['get', 'point_count'],
                    '#bdc9e1',
                    10,
                    '#74a9cf',
                    20,
                    '#0570b0',
                ],
                'circle-radius': [
                    'step',
                    ['get', 'point_count'],
                    15,
                    10,
                    20,
                    20,
                    30,
                ],
            },
        });

        this.map.addLayer({
            id: 'clustered-point-symbol',
            type: 'symbol',
            source: 'points',
            filter: ['has', 'point_count'],
            layout: {
                'text-field': '{point_count_abbreviated}',
                'text-size': 12,
            },
        });

        this.map.addLayer({
            id: 'unclustered-point-symbol',
            type: 'symbol',
            source: 'points',
            filter: ['!has', 'point_count'],
            layout: {
                'icon-allow-overlap': true,
                'text-allow-overlap': true,
                'text-size': 12,
                'text-offset': [0, 0.6],
                'text-anchor': 'top',
            },
        });

        this.map.addLayer({
            id: 'unclustered-point-circle',
            type: 'circle',
            source: 'points',
            filter: ['!has', 'point_count'],
            paint: {
                'circle-color': ['get', 'color'],
                'circle-radius': {
                    stops: [
                        [0, 10],
                        [20, 100],
                    ],
                    base: 2,
                },
            },
        });
    }

    addRegionsLayer = () => {
        this.map.addLayer({
            id: 'region-layer',
            type: 'fill',
            source: 'geojson',
            paint: {
                'fill-outline-color': '#ffffff',
                'fill-color': '#088',
                'fill-opacity': 0.5,
            },
        });
    }

    loadGeoRegions = (geoLocations) => {
        if (!geoLocations || !this.map) {
            return;
        }

        const source = this.map.getSource('geojson');
        const countriesData = {
            type: 'FeatureCollection',
            features: geoLocations.map(selection => (
                selection.geoJson.features)[0]),
        };
        if (source) {
            source.setData(countriesData);
            return;
        }

        this.map.addSource('geojson', {
            type: 'geojson',
            data: countriesData,
        });

        this.addRegionsLayer();
    }

    loadGeoPoints = (geoPoints) => {
        if (!geoPoints || !this.map) {
            return;
        }

        const pointsData = {
            type: 'FeatureCollection',
            features: geoPoints.map(points => (
                {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: points.coordinates,
                    },
                    properties: {
                        title: points.title,
                        icon: 'marker',
                        color: this.getColorForMarker(points.date),
                    },
                }
            )),
        };

        const source = this.map.getSource('points');
        if (source) {
            source.setData(pointsData);
            return;
        }
        this.map.addSource('points', {
            type: 'geojson',
            data: pointsData,
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 15,
        });
        this.addPointsLayers();
    }

    handleCtrlUp = (event) => {
        if (this.map && event.key === 'Control') {
            this.map.scrollZoom.disable();
        }
    }

    handleCtrlDown = (event) => {
        if (this.map && event.key === 'Control') {
            if (this.overlay) {
                this.overlay.style.display = 'none';
            }
            this.map.scrollZoom.enable();
        }
    }

    handleScroll = (event) => {
        if (!this.map) {
            return;
        }
        if (!this.map.scrollZoom.isEnabled() && !event.ctrlKey) {
            if (this.overlay) {
                this.overlay.style.display = 'flex';
            }
        }
        if (this.mapOverlayTimeout) {
            clearTimeout(this.mapOverlayTimeout);
        }
        this.mapOverlayTimout = setTimeout(
            () => { this.overlay.style.display = 'none'; },
            1000,
        );
    }

    render() {
        const {
            className,
            loading,
        } = this.props;
        const { pendingMap } = this.state;

        return (
            <div
                className={`${className} ${styles.container}`}
                ref={(el) => { this.mapContainer = el; }}
            >
                {
                    (pendingMap || loading) && (
                        <LoadingAnimation />
                    )
                }
                <div
                    className={`${styles.overlay} overlay`}
                    ref={(el) => { this.overlay = el; }}
                >
                    Use ctrl + scroll to zoom the map
                </div>
            </div>
        );
    }
}
