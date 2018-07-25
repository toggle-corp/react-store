import React from 'react';
import PropTypes from 'prop-types';
import hoistNonReactStatics from 'hoist-non-react-statics';

import FaramContext from './FaramContext';
import { isTruthy } from '../../../utils/common';


/*
 * FaramElementHOC
 *
 * Transforms a component that has `onChange` and `value`
 * props to a consumer of FaramContext and auto connect the
 * input `faramElementName` field of the form data.
 */


const propTypes = {
    faramElementName: PropTypes.string,
    faramElementIndex: PropTypes.number,
    forwardedRef: PropTypes.any, // eslint-disable-line react/forbid-prop-types
    faramAction: PropTypes.string,
    faramElement: PropTypes.bool,
    faramInfo: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    faramElementName: undefined,
    faramElementIndex: undefined,
    forwardedRef: undefined,
    faramAction: undefined,
    faramElement: false,
    faramInfo: undefined,
};

const FaramElement = elementType => (WrappedComponent) => {
    // NOTE: FaramElementHOC must not be a PureComponent
    class FaramElementHOC extends React.Component {
        static propTypes = propTypes;
        static defaultProps = defaultProps;

        calculateProps = (api) => {
            const {
                forwardedRef,
                faramElement,
                faramElementName,
                faramElementIndex,
                faramAction,
                faramInfo,
                ...otherProps
            } = this.props;

            // Set reference
            otherProps.ref = forwardedRef;

            if (!api) {
                return otherProps;
            }

            const faramIdentifier = faramElementName || faramElementIndex;
            if (faramElement || isTruthy(faramIdentifier) || isTruthy(faramAction)) {
                const values = {
                    ...api.getCalculatedProps({
                        faramIdentifier,
                        elementType,
                        faramAction,
                        faramInfo,
                    }),
                    ...otherProps,
                };
                return values;
            }

            return otherProps;
        }

        renderWrappedComponent = ({ api } = {}) => {
            const newProps = this.calculateProps(api);
            return <WrappedComponent {...newProps} />;
        }

        render() {
            return (
                <FaramContext.Consumer>
                    {this.renderWrappedComponent}
                </FaramContext.Consumer>
            );
        }
    }

    const ForwardedComponent = React.forwardRef((props, ref) => (
        <FaramElementHOC
            {...props}
            forwardedRef={ref}
        />
    ));

    return hoistNonReactStatics(
        ForwardedComponent,
        WrappedComponent,
    );
};

export default FaramElement;
