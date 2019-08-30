import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Float from '../Float';
import Haze from '../Haze';

import styles from './styles.scss';

// FIXME: reuse this
enum Keys {
    Tab = 9,
    Esc = 27,
    Enter = 13,
    Down = 38,
    Up = 40,
}


interface Props {
    className?: string;
    onBlur?: () => void;
    onMouseDown?: (e: MouseEvent) => void; // gets mouse down event
    parent?: HTMLElement;
    focusTrap: boolean;

    onInvalidate?: (e: HTMLInputElement) => object; // gets container
    showHaze: boolean;
    closeOnEscape: boolean;
    onClose?: (attributes: { escape: boolean }) => void;
}

/* Float with parent, onFocus and onBlur */
export default class FloatingContainer extends React.PureComponent<Props> {
    public static defaultProps = {
        focusTrap: false,
        showHaze: false,
        closeOnEscape: false,
    };

    public constructor(props: Props) {
        super(props);

        this.containerRef = React.createRef();
    }

    public componentDidMount() {
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

    public componentWillUnmount() {
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

    private containerRef: React.RefObject<HTMLInputElement>;

    private handleKeyPressed = (event: KeyboardEvent) => {
        const {
            closeOnEscape,
            onClose,
        } = this.props;

        if (onClose && closeOnEscape && event.keyCode === Keys.Esc) {
            onClose({ escape: true });
        }
    }

    private handleContainerInvalidate = () => {
        const { onInvalidate } = this.props;

        const { current: container } = this.containerRef;
        if (container && onInvalidate) {
            const containerStyles = onInvalidate(container);
            if (containerStyles) {
                Object.assign(container.style, containerStyles);
            } else {
                console.error('FloatingContainer.onInvalidate should return style');
            }
        }
    }

    private handleMouseDown = (e: MouseEvent) => {
        const {
            onBlur,
            onMouseDown,
            parent,
        } = this.props;

        if (!onBlur && !onMouseDown) {
            return;
        }

        const { current: container } = this.containerRef;

        const isTargetOrContainsTarget = container && (
            container === e.target || container.contains(e.target as HTMLElement)
        );

        const isTargetParentOrContainedInParent = parent && (
            parent === e.target || parent.contains(e.target as HTMLElement)
        );

        if (!(isTargetOrContainsTarget || isTargetParentOrContainedInParent)) {
            if (onBlur) {
                onBlur();
            }
        } else if (onMouseDown) {
            onMouseDown(e);
        }
    }

    public render() {
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
