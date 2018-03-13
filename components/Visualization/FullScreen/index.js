import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.scss';

const FullScreen = props => (<div className={styles.fullscreen}> {props.children} </div>);

FullScreen.propTypes = {
    children: PropTypes.node.isRequired,
};

export default FullScreen;
