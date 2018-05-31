import React from 'react';
import Raven from 'raven-js';
import PropTypes from 'prop-types';
import hoistNonReactStatics from 'hoist-non-react-statics';

import PrimaryButton from '../../Action/Button';

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

        componentDidCatch(error, errorInfo) {
            this.setState({ hasError: true });
            if (Raven.isSetup()) {
                // NOTE: Only in development error report will be applied twice
                Raven.captureException(error, { extra: errorInfo });
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

            // FIXME: style
            return (
                <div>
                    { defaultErrorText }
                    <PrimaryButton
                        onClick={() => Raven.lastEventId() && Raven.showReportDialog()}
                    >
                        Report
                    </PrimaryButton>
                </div>
            );
        }
    };

    const ForwardedComponent = React.forwardRef((props, ref) => (
        <Component
            {...props}
            forwardedRef={ref}
        />
    ));

    return hoistNonReactStatics(ForwardedComponent, WrappedComponent);
};
