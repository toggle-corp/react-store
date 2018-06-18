import React from 'react';
import PropTypes from 'prop-types';
import hoistNonReactStatics from 'hoist-non-react-statics';

const propTypes = {
    forwardedRef: PropTypes.any, // eslint-disable-line react/forbid-prop-types
    loading: PropTypes.bool,
    headerText: PropTypes.string.isRequired,
    colorScheme: PropTypes.arrayOf(PropTypes.string),

    className: PropTypes.string,
    vizContainerClass: PropTypes.string,
};

const defaultProps = {
    className: '',
    vizContainerClass: '',

    colorScheme: undefined,
    forwardedRef: undefined,
    loading: false,
};


const wrap = (WrappedComponent) => {
    const Component = class extends React.PureComponent {
        static propTypes = propTypes;
        static defaultProps = defaultProps;

        constructor(props) {
            super(props);
            this.state = {
                colorScheme: undefined,
                fullScreen: false,
            };
        }

        render() {
            const {
                forwardedRef,
                ...otherProps
            } = this.props;
            return (
                <WrappedComponent
                    ref={forwardedRef}
                    {...otherProps}
                />
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

export default wrap;
