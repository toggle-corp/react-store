import React from 'react';
import PropTypes from 'prop-types';
import mapboxgl from 'mapbox-gl';

import Message from '../../View/Message';

import styles from './styles.scss';


const nullComponent = () => null;

const propTypes = {
    className: PropTypes.string,
    bounds: PropTypes.arrayOf(PropTypes.number),
    childRenderer: PropTypes.func,
    panelsRenderer: PropTypes.func,
};

const defaultProps = {
    className: '',
    bounds: undefined,
    childRenderer: nullComponent,
    panelsRenderer: nullComponent,
};

export default class Map extends React.Component {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.mapContainer = React.createRef();
        this.leftBottomPanels = React.createRef();
        this.state = {
            map: undefined,
            zoomLevel: 3,
        };

        this.unsupportedBrowser = !mapboxgl.supported();
    }

    componentDidMount() {
        if (this.unsupportedBrowser) {
            return;
        }

        this.mounted = true;

        const {
            REACT_APP_MAPBOX_ACCESS_TOKEN: token,
            REACT_APP_MAPBOX_STYLE: style,
        } = process.env;

        // Add the mapbox map
        if (token) {
            mapboxgl.accessToken = token;
        }

        const map = new mapboxgl.Map({
            center: [84.1240, 28.3949],
            container: this.mapContainer.current,
            style,
            zoom: 3,
            minZoom: 3,
            maxZoom: 10,
            logoPosition: 'bottom-right',
            doubleClickZoom: false,
            preserveDrawingBuffer: true,
        });
        map.addControl(new mapboxgl.NavigationControl(), 'top-left');

        map.on('load', () => {
            // Since the map is loaded asynchronously, make sure
            // we are still mounted before doing setState
            if (this.mounted) {
                const { bounds } = this.props;
                if (bounds) {
                    map.fitBounds(
                        [[
                            bounds[0],
                            bounds[1],
                        ], [
                            bounds[2],
                            bounds[3],
                        ]],
                        { padding: 128 },
                    );
                }

                if (this.mounted) {
                    this.setState({ map });
                }
            }
        });

        map.on('zoom', () => {
            this.setState({
                zoomLevel: map.getZoom(),
            });
        });

        setTimeout(() => { map.resize(); }, 200);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.bounds !== nextProps.bounds && this.state.map) {
            const { bounds } = nextProps;
            const { map } = this.state;
            if (bounds) {
                map.fitBounds(
                    [[
                        bounds[0],
                        bounds[1],
                    ], [
                        bounds[2],
                        bounds[3],
                    ]],
                    { padding: 128 },
                );
            }
        }
    }

    componentWillUnmount() {
        this.mounted = false;

        // Remove the mapbox map
        const { map } = this.state;
        if (map) {
            this.setState({ map: undefined }, () => {
                map.remove();
            });
        }
    }

    getClassName = () => {
        const { className } = this.props;

        const classNames = [
            className,
            styles.map,
        ];

        return classNames.join(' ');
    }

    render() {
        const { childRenderer, panelsRenderer } = this.props;
        const { map } = this.state;

        const className = this.getClassName();
        const Child = childRenderer;
        const Panels = panelsRenderer;

        if (this.unsupportedBrowser) {
            return (
                <div
                    className={className}
                    ref={this.mapContainer}
                >
                    <Message>
                        {'Your browser doesn\'t support Mapbox!'}
                    </Message>
                </div>
            );
        }

        return (
            <div
                className={className}
                ref={this.mapContainer}
            >
                {map && (
                    <React.Fragment>
                        <Child
                            map={map}
                            zoomLevel={this.state.zoomLevel}
                        />
                        <div
                            className={styles.leftBottomPanels}
                            ref={this.leftBottomPanels}
                        >
                            <Panels
                                map={map}
                                zoomLevel={this.state.zoomLevel}
                            />
                        </div>
                    </React.Fragment>
                )}
            </div>
        );
    }
}
