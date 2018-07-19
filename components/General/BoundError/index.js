import React from 'react';
import PropTypes from 'prop-types';
import hoistNonReactStatics from 'hoist-non-react-statics';

const propTypes = {
    forwardedRef: PropTypes.any, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    forwardedRef: undefined,
};

export default ErrorComponent => (WrappedComponent) => {
    const BoundedComponent = class extends React.PureComponent {
        static propTypes = propTypes;
        static defaultProps = defaultProps;

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
            const { forwardedRef, ...otherProps } = this.props;

            if (!this.state.hasError) {
                return (
                    <WrappedComponent
                        ref={forwardedRef}
                        {...otherProps}
                    />
                );
            }

            if (ErrorComponent) {
                return <ErrorComponent />;
            }

            const defaultErrorText = '(x_x)';
            return (
                <div>
                    { defaultErrorText }
                </div>
            );
        }
    };

    const ForwardedComponent = React.forwardRef((props, ref) => (
        <BoundedComponent
            {...props}
            forwardedRef={ref}
        />
    ));

    return hoistNonReactStatics(ForwardedComponent, WrappedComponent);
};
