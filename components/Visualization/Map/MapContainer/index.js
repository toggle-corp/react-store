import React from 'react';
import PropTypes from 'prop-types';
import { _cs } from '@togglecorp/fujs';
import memoize from 'memoize-one';

import Responsive from '../../../General/Responsive';
import MapContext from '../context';
import styles from './styles.scss';

class MapContainer extends React.PureComponent {
    static propTypes = {
        className: PropTypes.string,
    }

    static defaultProps = {
        className: undefined,
    }

    resizeMap = memoize((boundingClientRect) => {
        if (this.context.map) {
            this.context.map.resize();
        }
    })

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
        const { boundingClientRect } = this.props;
        this.resizeMap(boundingClientRect);

        return (
            <MapContext.Consumer>
                {this.renderChild}
            </MapContext.Consumer>
        );
    }
}

MapContainer.contextType = MapContext;

export default Responsive(MapContainer);
