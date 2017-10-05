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
     * required for styling (styleName )
     */
    className: PropTypes.string,

    /**
     * Should it be closed when clicked outside the container?
     */
    closeOnBlur: PropTypes.bool,

    /**
     * Should container close on escape?
     */
    closeOnEscape: PropTypes.bool,

    /**
     * Unique id for the container
     */
    containerId: PropTypes.string.isRequired,

    /**
     * A callback when the container is closed
     */
    onClose: PropTypes.func.isRequired,

    /**
     * show modal ?
     */
    show: PropTypes.bool.isRequired,

    /**
     * styles
     */
    styleOverride: PropTypes.shape({
        left: PropTypes.string,
        top: PropTypes.string,
    }),
};

const defaultProps = {
    className: '',
    closeOnBlur: false,
    closeOnEscape: false,
    styleOverride: {},
};

@CSSModules(styles, { allowMultiple: true })
export default class FloatingContainer extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    componentDidMount() {
        this.mountComponent();
    }

    componentDidUpdate() {
        this.mountComponent();
    }

    mountComponent = () => {
        const {
            containerId,
            styleOverride,
        } = this.props;

        this.container = document.getElementById(containerId);

        if (this.props.show) {
            if (!this.container) {
                this.container = document.createElement('div');
                this.container.id = containerId;
                this.container.style.position = 'absolute';

                document.body.appendChild(this.container);
            }

            if (this.props.closeOnEscape) {
                document.removeEventListener('keydown', this.handleKeyPress);
                document.addEventListener('keydown', this.handleKeyPress);
            }

            if (this.props.closeOnBlur) {
                window.removeEventListener('mousedown', this.handleClick);
                window.addEventListener('mousedown', this.handleClick);
            }

            Object.assign(this.container.style, styleOverride);

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

    handleClick = (e) => {
        if (
            this.props.closeOnBlur
            && e.target !== this.container
            && !this.container.contains(e.target)
        ) {
            this.close();
        }
    }

    updateComponent = () => {
        ReactDOM.render(CSSModules(this.renderContent, styles)(), this.container);
    }

    close = () => {
        document.removeEventListener('keydown', this.handleKeyPress);
        window.removeEventListener('mousedown', this.handleClick);

        this.container.remove();
        this.props.onClose();
    }

    renderContent = () => (
        <div
            styleName="wrap"
            className={this.props.className}
        >
            { this.props.children }
        </div>
    )

    render() {
        return null;
    }
}
