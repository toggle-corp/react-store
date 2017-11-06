import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import FloatingContainer from '../FloatingContainer';
import styles from './styles.scss';

const propTypes = {
    /**
     * child elements
     */
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.element),
        PropTypes.element,
    ]).isRequired,

    /**
     * required for style override
     */
    className: PropTypes.string,

    /**
     * Should modal close on escape?
     */
    closeOnEscape: PropTypes.bool,

    /**
     * Should modal close on outside click?
     */
    closeOnBlur: PropTypes.bool,

    /**
     * A callback when the modal is closed
     */
    onClose: PropTypes.func.isRequired,

    /**
     * show modal ?
     */
    show: PropTypes.bool.isRequired,
};

const defaultProps = {
    className: '',
    closeOnEscape: false,
    closeOnBlur: false,
};

@CSSModules(styles, { allowMultiple: true })
export default class Modal extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        return (
            <FloatingContainer
                show={this.props.show}
                onClose={this.props.onClose}
                containerId="modal-container"
                closeOnEscape={this.props.closeOnEscape}
                closeOnBlur={this.props.closeOnBlur}
                className={`${this.props.className} modal-wrapper`}
            >
                <div
                    className="modal-content"
                    styleName="modal-content"
                >
                    { this.props.children }
                </div>
            </FloatingContainer>
        );
    }
}

export { default as Header } from './Header';
export { default as Body } from './Body';
export { default as Footer } from './Footer';
