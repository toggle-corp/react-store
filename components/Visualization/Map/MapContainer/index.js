import React from 'react';
import PropTypes from 'prop-types';
import { _cs } from '@togglecorp/fujs';

import Responsive from '../../../General/Responsive';
import MapContext from '../context';
import styles from './styles.scss';

class MapContainer extends React.PureComponent {
    static propTypes = {
        className: PropTypes.string,
        boundingClientRect: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    }

    static defaultProps = {
        className: undefined,
        boundingClientRect: undefined,
    }

    componentDidUpdate(prevProps) {
        if (prevProps.boundingClientRect !== this.props.boundingClientRect && this.context.map) {
            this.context.map.resize();
        }
    }

    renderChild = (injectedProps) => {
        const {
            className,
        } = this.props;
        const {
            mapContainerRef,
        } = injectedProps;

        return (
            <div
                className={_cs(className, styles.map)}
                ref={mapContainerRef}
            />
        );
    }

    render() {
        return (
            <MapContext.Consumer>
                {this.renderChild}
            </MapContext.Consumer>
        );
    }
}

MapContainer.contextType = MapContext;

export default Responsive(MapContainer);
