import React from 'react';
import PropTypes from 'prop-types';
import FloatingContainer from '../../View/FloatingContainer';

import styles from './styles.scss';

/**
 * Container class to set its children to fullscreen
 */
const FullScreen = ({ className, children }) => (
    <FloatingContainer
        className={`${className} ${styles.fullscreen}`}
    >
        {children}
    </FloatingContainer>
);

FullScreen.propTypes = {
    children: PropTypes.node.isRequired,
    /**
     * Additional css classes passed from parent
     */
    className: PropTypes.string,
};

FullScreen.defaultProps = {
    className: '',
};

export default FullScreen;
