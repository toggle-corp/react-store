import React from 'react';
import PropTypes from 'prop-types';
import hoistNonReactStatics from 'hoist-non-react-statics';
import { listToMap } from '@togglecorp/fujs';
import { FaramInputElement } from '@togglecorp/faram';

const propTypes = {
    value: PropTypes.any, // eslint-disable-line react/forbid-prop-types
    options: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    keySelector: PropTypes.func,
    onChange: PropTypes.func.isRequired,
};

const defaultProps = {
    value: undefined,
    options: [],
    keySelector: d => d.key,
};

export default (WrappedComponent) => {
    const complement = (value, options, keySelector) => {
        const mapping = listToMap(
            value,
            val => val,
            () => true,
        );
        return options.map(keySelector).filter(key => !mapping[key]);
    };

    const ComplementedComponent = class extends React.PureComponent {
        static propTypes = propTypes;

        static defaultProps = defaultProps;

        constructor(props) {
            super(props);

            const {
                options,
                value,
                keySelector,
            } = this.props;
            this.complementedValue = complement(value, options, keySelector);
        }

        UNSAFE_componentWillReceiveProps(nextProps) {
            const {
                options: oldOptions,
                value: oldValue,
                keySelector: oldKeySelector,
            } = this.props;
            const {
                options: newOptions,
                value: newValue,
                keySelector: newKeySelector,
            } = nextProps;
            if (
                oldOptions !== newOptions
                || oldValue !== newValue
                || oldKeySelector !== newKeySelector
            ) {
                this.complementedValue = complement(newValue, newOptions, newKeySelector);
            }
        }

        handleChange = (value) => {
            const {
                onChange,
                options,
                keySelector,
            } = this.props;
            const complementedValue = complement(value, options, keySelector);
            onChange(complementedValue);
        }

        render() {
            const {
                value, // eslint-disable-line no-unused-vars, @typescript-eslint/no-unused-vars
                onChange, // eslint-disable-line no-unused-vars, @typescript-eslint/no-unused-vars
                ...otherProps
            } = this.props;

            return (
                <WrappedComponent
                    value={this.complementedValue}
                    onChange={this.handleChange}
                    {...otherProps}
                />
            );
        }
    };

    const ComplementedFaramComponent = FaramInputElement(ComplementedComponent);

    return hoistNonReactStatics(ComplementedFaramComponent, WrappedComponent);
};
