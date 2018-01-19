import PropTypes from 'prop-types';
import React from 'react';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

export default function (WrappedComponent) {
    return class extends React.Component {
        static propTypes = propTypes;
        static defaultProps = defaultProps;

        constructor(props) {
            super(props);

            this.state = {
                boundingClientRect: {},
                parentBoundingClientRect: {},
            };

            this.wrappedComponent = undefined;
        }

        componentDidMount() {
            window.addEventListener('resize', this.handleWindowResize);
            setTimeout(this.handleMount, 0);
        }

        componentWillUnmount() {
            window.removeEventListener('resize', this.handleWindowResize);
        }

        onResize() {
            if (this.wrappedComponent && this.wrappedComponent.onResize) {
                this.wrappedComponent.onResize();
            }
        }

        initializeRects = (callback) => {
            let boundingClientRect = {};
            let parentBoundingClientRect = {};

            if (this.container) {
                const { parentNode, getBoundingClientRect } = this.container;

                boundingClientRect = getBoundingClientRect();
                if (parentNode) {
                    parentBoundingClientRect = parentNode.getBoundingClientRect();
                }
            }

            this.setState(
                {
                    boundingClientRect,
                    parentBoundingClientRect,
                },
                (boundingClientRectangle, parentBoundingClientRectangle) => {
                    callback(boundingClientRectangle, parentBoundingClientRectangle);
                },
            );
        }

        handleMount = () => {
            const afterRectInit = () => {
                this.onResize();
            };
            this.initializeRects(afterRectInit);
        };

        handleWindowResize = () => {
            const previousClientRect = this.state.boundingClientRect;
            const afterRectInit = (boundingClientRect) => {
                if (previousClientRect.width !== boundingClientRect.width ||
                    previousClientRect.height !== boundingClientRect.height) {
                    this.onResize();
                }
            };
            this.initializeRects(afterRectInit);
        }

        render() {
            const {
                boundingClientRect,
                parentBoundingClientRect,
            } = this.state;

            const {
                className,
                ...otherProps
            } = this.props;

            return (
                <div
                    ref={(el) => { this.container = el; }}
                    className={`responsive-wrapper ${className}`}
                >
                    <WrappedComponent
                        ref={(element) => { this.wrappedComponent = element; }}
                        boundingClientRect={boundingClientRect}
                        parentBoundingClientRect={parentBoundingClientRect}
                        {...otherProps}
                    />
                </div>
            );
        }
    };
}
