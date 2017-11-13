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
            };
        }

        componentDidMount() {
            window.addEventListener('resize', this.handleWindowResize);
            setTimeout(() => {
                let boundingClientRect = {};
                let parentBoundingClientRect = {};

                if (this.container) {
                    boundingClientRect = this.container.getBoundingClientRect();

                    if (this.container.parentNode) {
                        parentBoundingClientRect = (
                            this.container.parentNode.getBoundingClientRect()
                        );
                    }
                }

                this.setState({
                    boundingClientRect,
                    parentBoundingClientRect,
                });
            }, 0);
        }

        componentWillUnmount() {
            window.removeEventListener('resize', this.handleWindowResize);
        }

        handleWindowResize = () => {
            let boundingClientRect = {};
            let parentBoundingClientRect = {};

            if (this.container) {
                boundingClientRect = this.container.getBoundingClientRect();

                if (this.container.parentNode) {
                    parentBoundingClientRect = this.container.parentNode.getBoundingClientRect();
                }
            }

            this.setState({
                boundingClientRect,
                parentBoundingClientRect,
            });
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
                    className={className}
                >
                    <WrappedComponent
                        boundingClientRect={boundingClientRect}
                        parentBoundingClientRect={parentBoundingClientRect}
                        {...otherProps}
                    />
                </div>
            );
        }
    };
}
