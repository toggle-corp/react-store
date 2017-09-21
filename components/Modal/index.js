import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';

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
     * Should modal close on escape?
     */
    closeOnEscape: PropTypes.bool,

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
    closeOnEscape: false,
};

@CSSModules(styles, { allowMultiple: true })
export default class Modal extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    componentDidMount() {
        this.mountComponent();
    }

    componentDidUpdate() {
        this.mountComponent();
    }

    mountComponent = () => {
        this.container = document.getElementById('modal-container');

        if (this.props.show) {
            if (!this.container) {
                this.container = document.createElement('div');
                this.container.id = 'modal-container';
                document.body.appendChild(this.container);
            }

            document.removeEventListener('keydown', this.handleKeyPress);
            document.addEventListener('keydown', this.handleKeyPress);

            this.updateComponent();
        } else if (this.container) {
            this.container.remove();
        }
    }

    handleKeyPress = (e) => {
        if (this.props.closeOnEscape && e.code === 'Escape') {
            this.close();
        }
    }

    updateComponent = () => {
        ReactDOM.render(CSSModules(this.renderModalContent, styles)(), this.container);
    }

    close = () => {
        this.container.remove();
        this.props.onClose();
    }

    renderModalContent = () => (
        <div styleName="modal-content">
            { this.props.children }
        </div>
    )

    render() {
        return null;
    }
}

export { default as Header } from './Header';
export { default as Body } from './Body';
export { default as Footer } from './Footer';
