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
        PropTypes.node,
        PropTypes.arrayOf(PropTypes.node),
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
     * Should container close on Escape keypress?
     */
    closeOnEscape: PropTypes.bool,

    /**
     * Should container close on Tab keypress?
     */
    closeOnTab: PropTypes.bool,

    /**
     * Unique id for the container
     */
    containerId: PropTypes.string.isRequired,

    /**
     * Callback for dynamic style
     */
    onDynamicStyleOverride: PropTypes.func,

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
    closeOnTab: false,
    onDynamicStyleOverride: undefined,
    styleOverride: {},
};

export default class FloatingContainer extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    componentDidUpdate() {
        const { onDynamicStyleOverride } = this.props;

        if (onDynamicStyleOverride && this.container) {
            const dynamicStyles = onDynamicStyleOverride(this.container);

            if (dynamicStyles) {
                Object.assign(this.container.style, dynamicStyles);
            }
        }
    }

    componentWillUnmount() {
        if (this.container) {
            this.removeContainer();
        }
    }

    getContent = () => (
        <div
            className={this.props.className}
            styleName="wrap"
        >
            { this.props.children }
        </div>
    )

    getValue = () => (this.state.inputValue)


    getContainer = () => {
        const {
            containerId,
            styleOverride,
        } = this.props;

        this.container = document.getElementById(containerId);

        // Create the container if it doesn't exist
        if (!this.container) {
            this.container = document.createElement('div');
        }

        // Style the container
        this.container.id = containerId;
        this.container.style.position = 'absolute';

        // Add new container to DOM
        document.body.appendChild(this.container);

        // Add event listeners
        if (this.props.closeOnEscape || this.props.closeOnTab) {
            document.addEventListener('keydown', this.handleKeyPress);
        }
        if (this.props.closeOnBlur) {
            window.addEventListener('mousedown', this.handleClick);
        }

        // append style provided by parent 
        Object.assign(this.container.style, styleOverride);

        return this.container;
    }

    isFocused = () => (this.state.showOptions)

    removeContainer = () => {
        // remove listeners
        document.removeEventListener('keydown', this.handleKeyPress);
        window.removeEventListener('mousedown', this.handleClick);

        // remove container element from DOM
        this.container.remove();
    }

    close = () => {
        this.removeContainer();

        // call callback
        this.props.onClose();
    }

    handleKeyPress = (e) => {
        if (this.props.closeOnEscape && e.code === 'Escape') {
            this.close();
        }

        if (this.props.closeOnTab && e.code === 'Tab') {
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

    render() {
        if (!this.props.show) {
            if (this.container) {
                this.removeContainer();
            }
            return null;
        }
        return ReactDOM.createPortal(
            CSSModules(this.getContent, styles)(),
            this.getContainer(),
        );
    }
}
