import PropTypes from 'prop-types';
import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Float from '../Float';
import Haze from '../Haze';

import styles from './styles.scss';

const ESCAPE_KEY = 27;

const propTypes = {
    /**
     * child elements
     */
    children: PropTypes.oneOfType([
        PropTypes.node,
        PropTypes.arrayOf(PropTypes.node),
    ]).isRequired,

    className: PropTypes.string,

    onBlur: PropTypes.func,

    onMouseDown: PropTypes.func,

    /**
     * container for which clicks are ignored for blur
     */
    parent: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    focusTrap: PropTypes.bool,

    onInvalidate: PropTypes.func,

    showHaze: PropTypes.bool,

    // closeOnEscape will only work if onClose function is provided with
    closeOnEscape: PropTypes.bool,

    onClose: PropTypes.func,
};

const defaultProps = {
    className: '',
    focusTrap: false,
    showHaze: false,
    onBlur: undefined,
    onClose: undefined,
    onMouseDown: undefined,
    closeOnEscape: false,
    parent: undefined,
    onInvalidate: undefined,
};

/* Float with parent, onFocus and onBlur */
export default class FloatingContainer extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.containerRef = React.createRef();
    }

    componentDidMount() {
        const {
            onBlur,
            closeOnEscape,
        } = this.props;

        if (onBlur) {
            window.addEventListener('mousedown', this.handleMouseDown);
        }
        if (closeOnEscape) {
            document.addEventListener('keydown', this.handleKeyPressed);
        }
    }

    componentWillUnmount() {
        const {
            onBlur,
            closeOnEscape,
        } = this.props;

        if (onBlur) {
            window.removeEventListener('mousedown', this.handleMouseDown);
        }
        if (closeOnEscape) {
            document.removeEventListener('keydown', this.handleKeyPressed);
        }
    }

    handleKeyPressed = (event) => {
        const {
            closeOnEscape,
            onClose,
        } = this.props;

        const { current: container } = this.containerRef;
        const isLastModal = container && container.dataset.lastModal === 'true';

        if (isLastModal && closeOnEscape && event.keyCode === ESCAPE_KEY && onClose) {
            onClose({ escape: true });
        }
    }

    handleContainerInvalidate = () => {
        const { onInvalidate } = this.props;
        if (!onInvalidate) {
            return;
        }

        const { current: container } = this.containerRef;
        if (container) {
            const containerStyles = onInvalidate(container);
            if (containerStyles) {
                Object.assign(container.style, containerStyles);
            } else {
                console.error('FloatingContainer.onInvalidate should return style');
            }
        }
    }

    handleMouseDown = (e) => {
        const {
            onBlur,
            onMouseDown,
            parent,
        } = this.props;

        if (!(onBlur || onMouseDown)) {
            return;
        }

        const { current: container } = this.containerRef;

        const isTargetOrContainsTarget = container && (
            container === e.target || container.contains(e.target)
        );
        const isTargetParentOrContainedInParent = parent && (
            parent === e.target || parent.contains(e.target)
        );

        if (!(isTargetOrContainsTarget || isTargetParentOrContainedInParent)) {
            if (onBlur) {
                onBlur();
            }
        } else if (onMouseDown) {
            onMouseDown(e);
        }
    }

    render() {
        const {
            className: classNameFromProps,
            focusTrap,
            children,
            showHaze,
        } = this.props;

        const className = _cs(
            classNameFromProps,
            styles.floatingContainer,
            'floating-container',
        );

        const child = (
            <div
                className={className}
                ref={this.containerRef}
            >
                { children }
            </div>
        );

        return (
            <Float
                onInvalidate={this.handleContainerInvalidate}
                focusTrap={focusTrap}
            >
                {showHaze ? (
                    <Haze>
                        {child}
                    </Haze>
                ) : (
                    child
                )}
            </Float>
        );
    }
}
