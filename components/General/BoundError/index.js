import React from 'react';
import PropTypes from 'prop-types';
// import hoistNonReactStatics from 'hoist-non-react-statics';

const propTypes = {
    forwardedRef: PropTypes.any, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    forwardedRef: undefined,
};

export default ErrorComponent => (WrappedComponent) => {
    const Component = class extends React.PureComponent {
        static propTypes = propTypes;
        static defaultProps = defaultProps;

        constructor(props) {
            super(props);

            this.state = {
                hasError: false,
            };
        }

        componentDidCatch() {
            this.setState({ hasError: true });
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

    return React.forwardRef((props, ref) => (
        <Component
            {...props}
            forwardedRef={ref}
        />
    ));

    // return hoistNonReactStatics(Component, WrappedComponent);
};
