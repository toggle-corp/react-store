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
};

const defaultProps = {
    map: undefined,
    zoomLevel: undefined,
    children: false,
    onSourceAdded: undefined,
    onSourceRemoved: undefined,
    supportHover: false,
    setDestroyer: undefined,
};


@MapChild
export default class MapSource extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.childDestroyers = {};
        if (props.setDestroyer) {
            props.setDestroyer(props.sourceKey, this.destroy);
        }
    }

    componentDidMount() {
        this.create(this.props);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.map !== nextProps.map) {
            this.destroy();
            this.create(nextProps);
        }
    }

    componentWillUnmount() {
        this.destroy();
    }

    setChildDestroyer = (key, destroyer) => {
        this.childDestroyers[key] = destroyer;
    }

    destroy = () => {
        Object.keys(this.childDestroyers).forEach((key) => {
            this.childDestroyers[key]();
        });

        const { map, onSourceRemoved } = this.props;
        if (map) {
            if (this.source) {
                map.removeSource(this.source);
            }
            if (this.hoverSource) {
                map.removeSource(this.hoverSource);
            }
        }
        if (onSourceRemoved) {
            onSourceRemoved();
        }
        this.source = undefined;
        this.hoverSource = undefined;
    }

    create = (props) => {
        const {
            map,
            sourceKey,
            geoJson,
            onSourceAdded,
            supportHover,
        } = props;

        map.addSource(sourceKey, {
            type: 'geojson',
            data: geoJson,
        });
        this.source = sourceKey;

        if (supportHover) {
            map.addSource(`${sourceKey}-hover`, {
                type: 'geojson',
                data: geoJson,
            });
            this.hoverSource = `${sourceKey}-hover`;
        }

        if (onSourceAdded) {
            onSourceAdded();
        }
    }

    render() {
        if (!this.source) {
            return null;
        }

        const { map, zoomLevel, sourceKey, children } = this.props;
        const childrenProps = {
            map,
            zoomLevel,
            sourceKey,
            setDestroyer: this.setChildDestroyer,
        };

        return (
            <MapContext.Provider value={childrenProps}>
                {children}
            </MapContext.Provider>
        );
    }
}
