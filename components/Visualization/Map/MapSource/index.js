import React from 'react';
import PropTypes from 'prop-types';


const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    map: PropTypes.object,
    // eslint-disable-next-line react/no-unused-prop-types
    sourceKey: PropTypes.string.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    onSourceAdded: PropTypes.func,
    onSourceRemoved: PropTypes.func,
    // eslint-disable-next-line react/no-unused-prop-types
    supportHover: PropTypes.bool,
};

const defaultProps = {
    map: undefined,
    onSourceAdded: undefined,
    onSourceRemoved: undefined,
    supportHover: false,
};


export default class MapSource extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

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

    destroy = () => {
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
        return null;
    }
}
