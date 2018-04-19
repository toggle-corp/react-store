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
    listAdd: PropTypes.bool,
    listRemove: PropTypes.bool,
};

const defaultProps = {
    faramElementName: undefined,
    faramElementIndex: undefined,
    forwardedRef: undefined,
    listAdd: false,
    listRemove: false,
};

const FaramElement = elementType => (WrappedComponent) => {
    class FaramElementHOC extends React.PureComponent {
        static propTypes = propTypes;
        static defaultProps = defaultProps;

        calculateProps = (api) => {
            const {
                faramElementName,
                faramElementIndex,
                listAdd,
                listRemove,
                forwardedRef,
                ...props
            } = this.props;
            props.ref = forwardedRef;

            if (!api) {
                return props;
            }

            if (isTruthy(faramElementName)) {
                return {
                    ...api.getCalculatedProps(faramElementName, elementType),
                    ...props,
                };
            }

            if (listAdd || listRemove || isTruthy(faramElementIndex)) {
                return {
                    ...api.getCalculatedProps(
                        faramElementIndex, elementType,
                        listAdd, listRemove,
                    ),
                    ...props,
                };
            }

            return props;
        }

        renderWrappedComponent = (api) => {
            const newProps = this.calculateProps(api);
            return (
                <WrappedComponent
                    {...newProps}
                />
            );
        }

        render() {
            const {
                faramElementName,
                faramElementIndex,
                listAdd,
                listRemove,
                forwardedRef,
                ...props
            } = this.props;

            if (isTruthy(faramElementName)) {
                return (
                    <FaramContext.Group.Consumer>
                        {this.renderWrappedComponent}
                    </FaramContext.Group.Consumer>
                );
            } else if (listAdd || listRemove || isTruthy(faramElementIndex)) {
                return (
                    <FaramContext.List.Consumer>
                        {this.renderWrappedComponent}
                    </FaramContext.List.Consumer>
                );
            }

            return (
                <WrappedComponent
                    ref={forwardedRef}
                    {...props}
                />
            );
        }
    }

    return hoistNonReactStatics(
        React.forwardRef((props, ref) => (
            <FaramElementHOC {...props} forwardedRef={ref} />
        )),
        WrappedComponent,
    );
};

export default FaramElement;
