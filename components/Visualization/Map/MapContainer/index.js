import React from 'react';
import PropTypes from 'prop-types';

import { _cs } from '@togglecorp/fujs';

import MapContext from '../context';
import styles from './styles.scss';

export default class MapContainer extends React.PureComponent {
    static propTypes = {
        className: PropTypes.string,
    }

    static defaultProps = {
        className: undefined,
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
