import React from 'react';
import PropTypes from 'prop-types';
import hoistNonReactStatics from 'hoist-non-react-statics';

export default ErrorComponent => (WrappedComponent) => {
    const BoundedComponent = class extends React.PureComponent {
        static propTypes = {
            className: PropTypes.string,
        }

        static defaultProps = {
            className: '',
        };

        constructor(props) {
            super(props);

            this.state = {
                hasError: false,
            };
        }

        componentDidCatch(error, errorInfo) {
            this.setState({ hasError: true });

            if (ErrorComponent && ErrorComponent.handleException) {
                ErrorComponent.handleException(error, errorInfo);
            }
        }

        render() {
            const {
                hasError,
            } = this.state;

            if (!hasError) {
                return (
                    <WrappedComponent {...this.props} />
                );
            }

            if (ErrorComponent) {
                return (
                    <ErrorComponent
                        {...this.props}
                    />
                );
            }

            const defaultErrorText = '(x_x)';
            const { className } = this.props;
            return (
                <div className={className}>
                    { defaultErrorText }
                </div>
            );
        }
    };

    return hoistNonReactStatics(BoundedComponent, WrappedComponent);
};
