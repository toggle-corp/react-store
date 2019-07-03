import React from 'react';
import PropTypes from 'prop-types';

import { _cs } from '@togglecorp/fujs';

import MapChild from '../MapChild';
import styles from './styles.scss';

@MapChild
export default class MapContainer extends React.PureComponent {
    static propTypes = {
        className: PropTypes.string,
        // eslint-disable-next-line react/forbid-prop-types
        mapContainerRef: PropTypes.object.isRequired,
    }

    static defaultProps = {
        className: undefined,
    }

    render() {
        const {
            className,
            mapContainerRef,
        } = this.props;

        return (
            <div
                className={_cs(className, styles.map)}
                ref={mapContainerRef}
            />
        );
    }
}
