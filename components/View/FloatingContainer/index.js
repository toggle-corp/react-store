import PropTypes from 'prop-types';
import React from 'react';
import Float from '../Float';

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

    onInvalidate: PropTypes.func,
};

const defaultProps = {
    className: '',
    onBlur: undefined,
    onMouseDown: undefined,
    parent: undefined,
    onInvalidate: () => {},
};

export default class FloatingContainer extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    componentWillMount() {
        const { onBlur } = this.props;
        if (onBlur) {
            window.addEventListener('mousedown', this.handleMouseDown);
        }
    }

    componentWillUnmount() {
        window.removeEventListener('mousedown', this.handleMouseDown);
    }

    invalidate() {
        const { onInvalidate } = this.props;

        if (this.container) {
            const containerStyles = onInvalidate(this.container);

            if (containerStyles) {
                Object.assign(this.container.style, containerStyles);
            }
        }
    }

    handleContainerInvalidate = () => {
        this.invalidate();
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

        const isTargetOrContainsTarget = this.container && (
            this.container === e.target || this.container.contains(e.target)
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
            className,
            children,
        } = this.props;

        return (
            <Float onInvalidate={this.handleContainerInvalidate}>
                <div
                    className={`${className} ${styles['floating-container']}`}
                    ref={(el) => { this.container = el; }}
                >
                    { children }
                </div>
            </Float>
        );
    }
}
