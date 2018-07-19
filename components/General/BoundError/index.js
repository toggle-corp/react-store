import React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';

export default ErrorComponent => (WrappedComponent) => {
    const BoundedComponent = class extends React.PureComponent {
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
            const { ...otherProps } = this.props;

            if (!this.state.hasError) {
                return (
                    <WrappedComponent {...otherProps} />
                );
            }

            if (ErrorComponent) {
                return (
                    <ErrorComponent
                        {...otherProps}
                    />
                );
            }

            const defaultErrorText = '(x_x)';
            return (
                <div>
                    { defaultErrorText }
                </div>
            );
        }
    };

    return hoistNonReactStatics(BoundedComponent, WrappedComponent);
};
