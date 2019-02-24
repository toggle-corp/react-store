import PropTypes from 'prop-types';
import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Float from '../Float';
import Haze from '../Haze';

import styles from './styles.scss';

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
};

const defaultProps = {
    className: '',
    focusTrap: false,
    showHaze: false,
    onBlur: undefined,
    onMouseDown: undefined,
    parent: undefined,
    onInvalidate: () => {},
};

/* Float with parent, onFocus and onBlur */
export default class FloatingContainer extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.containerRef = React.createRef();
    }

    componentWillMount() {
        const { onBlur } = this.props;
        if (onBlur) {
            window.addEventListener('mousedown', this.handleMouseDown);
        }
    }

    componentWillUnmount() {
        window.removeEventListener('mousedown', this.handleMouseDown);
    }

    handleContainerInvalidate = () => {
        const { onInvalidate } = this.props;

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
            onMouseDown();
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
