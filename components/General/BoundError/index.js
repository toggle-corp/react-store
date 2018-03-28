import React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';


export default ErrorComponent => (WrappedComponent) => {
    const Component = class extends React.PureComponent {
        constructor(props) {
            super(props);

            this.state = {
                hasError: false,
            };
        }

        componentDidCatch(error, info) {
            this.setState({ hasError: true });
            console.error(info);
        }

        render() {
            if (!this.state.hasError) {
                return <WrappedComponent {...this.props} />;
            }

            if (ErrorComponent) {
                return <ErrorComponent />;
            }

            return (
                <div>
                    An unexpected error has occured!
                </div>
            );
        }
    };

    return hoistNonReactStatics(Component, WrappedComponent);
};
