import React from 'react';
import PropTypes from 'prop-types';
import FloatingContainer from '../../View/FloatingContainer';
import styles from './styles.scss';

const FullScreen = props => (
    <FloatingContainer
        className={styles.fullscreen}
    >
        {props.children}
    </FloatingContainer>
);

FullScreen.propTypes = {
    children: PropTypes.node.isRequired,
};

export default FullScreen;
