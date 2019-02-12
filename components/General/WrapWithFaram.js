import PropTypes from 'prop-types';
import React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';

import Faram, { detachedFaram } from './Faram';

const propTypes = {
    faramClassName: PropTypes.string,
    schema: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    faramClassName: '',
};


export default ({ submitAction, submitCallback }) => (WrappedComponent) => {
    class FaramWrappedComponent extends React.PureComponent {
        static propTypes = propTypes;
        static defaultProps = defaultProps;

        constructor(props) {
            super(props);

            this.state = {
                faramValues: {},
                faramErrors: {},
            };
        }

        handleFaramSuccess = (values) => {
            const { [submitCallback]: onSubmit } = this.props;
            if (onSubmit) {
                onSubmit(values);
            }
        }

        handleFaramFailure = (faramErrors) => {
            this.setState({ faramErrors });
        }

        handleFaramChange = (faramValues, faramErrors) => {
            this.setState({
                faramValues,
                faramErrors,
            });
        }

        handleSubmit = () => {
            detachedFaram({
                value: this.state.faramValues,
                schema: this.props.schema,
                onValidationFailure: this.handleFaramFailure,
                onValidationSuccess: this.handleFaramSuccess,
            });
        }

        render() {
            const {
                schema,
                [submitCallback]: onSubmit, // eslint-disable-line no-unused-vars
                faramClassName,
                ...otherProps
            } = this.props;

            const {
                faramValues,
                faramErrors,
            } = this.state;

            const newProps = { ...otherProps };
            if (submitAction) {
                newProps[submitAction] = this.handleSubmit;
            }

            return (
                <Faram
                    className={faramClassName}
                    onChange={this.handleFaramChange}
                    onValidationFailure={this.handleFaramFailure}
                    onValidationSuccess={this.handleFaramSuccess}
                    schema={schema}
                    value={faramValues}
                    error={faramErrors}
                >
                    <WrappedComponent {...newProps} />
                </Faram>
            );
        }
    }

    return hoistNonReactStatics(
        FaramWrappedComponent,
        WrappedComponent,
    );
};
