import React from 'react';
import PropTypes from 'prop-types';

import mapboxgl from 'mapbox-gl';

import {
    LoadingAnimation,
} from '../../View';
import { getDifferenceInDays } from '../../../utils/common';

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
};

const defaultProps = {
    className: '',
    onAreaClick: undefined,
    geoLocations: [],
    geoPoints: [],
    geoJsonBounds: undefined,
};

export default class GeoRefrencedMap extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            map: undefined,
        };
    }

    componentDidMount() {
        this.mounted = true;
        mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

        const map = new mapboxgl.Map({
            center: [50, 10],
            container: this.mapContainer,
            style: process.env.REACT_APP_MAPBOX_STYLE,
            zoom: 2,
        });

        map.on('load', () => {
            if (this.mounted) {
                this.setState({ map }, () => {
                    this.loadGeoJson(this.props.geoLocations, this.props.geoPoints);
                });
            }
        });
        setTimeout(() => { map.resize(); }, 900);

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
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.geoLocations !== nextProps.geoLocations
            || this.props.geoPoints !== nextProps.geoPoints) {
            this.loadGeoJson(nextProps.geoLocations);
        }
    }

    componentWillUnmount() {
        const { map } = this.state;
        if (map) {
            map.removeLayer('region-layer');
            map.removeLayer('points-layer');
            map.removeLayer('clustered-point-symbol');
            map.removeLayer('unclustered-point-symbol');
            map.removeLayer('unclustered-point-circle');
            map.remove();
            this.setState({ map: undefined });
        }
        this.mounted = false;
    }

    getColorForMarker = (date) => {
        const today = new Date();
        const daysDifference = getDifferenceInDays(today, new Date(date));
        if (daysDifference < 30) {
            return '#fbb4b9';
        } else if (daysDifference < 180) {
            return '#f768a1';
        }
        return '#ae017e';
    }

    loadGeoJson(geoLocations, geoPoints) {
        const { map } = this.state;
        if (!geoLocations || !map) {
            return;
        }
        map.addSource('geojson', {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: geoLocations.map(selection =>
                    (selection.geoJson.features)[0]),
            },
        });
        map.addSource('points', {
            type: 'geojson',
            data: {
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
            },
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 15,
        });

        map.addLayer({
            id: 'region-layer',
            type: 'fill',
            source: 'geojson',
            paint: {
                'fill-outline-color': '#ffffff',
                'fill-color': '#088',
                'fill-opacity': 0.5,
            },
        });

        map.addLayer({
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

        map.addLayer({
            id: 'clustered-point-symbol',
            type: 'symbol',
            source: 'points',
            filter: ['has', 'point_count'],
            layout: {
                'text-field': '{point_count_abbreviated}',
                'text-size': 12,
            },
        });

        map.addLayer({
            id: 'unclustered-point-symbol',
            type: 'symbol',
            source: 'points',
            filter: ['!has', 'point_count'],
            layout: {
                'icon-allow-overlap': true,
                'text-allow-overlap': true,
                'text-field': '{title}',
                'text-size': 12,
                'text-offset': [0, 0.6],
                'text-anchor': 'top',
            },
        });

        map.addLayer({
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

    render() {
        const {
            className,
        } = this.props;

        return (
            <div
                className={className}
                ref={(el) => { this.mapContainer = el; }}
                style={{ position: 'relative' }}
            >
                {!this.state.map && (
                    <LoadingAnimation />
                )}
            </div>
        );
    }
}
