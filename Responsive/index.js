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
                this.setState({
                    boundingClientRect: this.container ? (
                        this.container.getBoundingClientRect()
                    ) : (
                        {}
                    ),
                });
            }, 0);
        }

        componentWillUnmount() {
            window.removeEventListener('resize', this.handleWindowResize);
        }

        handleWindowResize = () => {
            this.setState({
                boundingClientRect: this.container ? (
                    this.container.getBoundingClientRect()
                ) : (
                    {}
                ),
            });
        }

        render() {
            const {
                boundingClientRect,
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
                        {...otherProps}
                    />
                </div>
            );
        }
    };
}
