import React from 'react';
import PropTypes from 'prop-types';

import mapboxgl from 'mapbox-gl';

import {
    LoadingAnimation,
} from '../../View';
import iconNames from '../../../constants/iconNames';
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
                    this.loadGeoJson(this.props.geoLocations);
                    this.setGeoPoints(this.props.geoPoints);
                });
            }
        });
        setTimeout(() => { map.resize(); }, 900);

        const popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
        });

        map.on('mousemove', 'regions', (e) => {
            const feature = e.features[0];
            map.getCanvas().style.cursor = 'pointer';
            popup.setLngLat([
                e.lngLat.lng,
                e.lngLat.lat + 0.1,
            ]).setHTML(feature.properties.name);
        });

        map.on('mouseenter', 'regions', (e) => {
            const feature = e.features[0];
            popup.setHTML(feature.properties.name)
                .addTo(map);
        });

        map.on('mouseleave', 'regions', () => {
            map.getCanvas().style.cursor = '';

            popup.remove();
        });
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.geoLocations !== nextProps.geoLocations) {
            this.loadGeoJson(nextProps.geoLocations);
        }
        if (this.props.geoPoints !== nextProps.geoPoints) {
            this.setGeoPoints(nextProps.geoPoints);
        }
    }

    componentWillUnmount() {
        const { map } = this.state;
        if (map) {
            map.removeLayer('regions');
            map.remove();
            this.setState({ map: undefined });
        }
        this.mounted = false;
    }

    getColorForMarker = (date) => {
        const today = new Date();
        const daysDifference = getDifferenceInDays(today, new Date(date));
        if (daysDifference < 30) {
            return '#2b90d9';
        } else if (daysDifference < 180) {
            return '#ff5f2e';
        }
        return '#e71d36';
    }

    setGeoPoints(geoPoints) {
        const { map } = this.state;
        if (!map || geoPoints.length === 0) {
            return;
        }
        geoPoints.forEach((points) => {
            const el = document.createElement('span');
            el.className = iconNames.location;
            el.style.color = this.getColorForMarker(points.date);
            el.style.fontSize = '32px';

            const marker = new mapboxgl
                .Marker(el, { offset: [0, -5] })
                .setLngLat(points.coordinates)
                .setPopup(
                    new mapboxgl.Popup({
                        closeButton: false,
                        closeOnClick: true,
                    }).setLngLat(points.coordinates).setHTML(points.title));

            marker.getElement().style.cursor = 'pointer';
            marker.addTo(map);
        });
    }

    loadGeoJson(geoLocations) {
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
        map.addLayer({
            id: 'regions',
            type: 'fill',
            source: 'geojson',
            paint: {
                'fill-color': '#088',
                'fill-opacity': 0.5,
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
