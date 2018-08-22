import PropTypes from 'prop-types';
import React from 'react';

import { FaramInputElement } from '../FaramElements';
import FormContext from '../Form/FormContext';

import FaramGroupApi from './FaramGroupApi';

const propTypes = {
    children: PropTypes.node.isRequired,
    onChange: PropTypes.func,
    value: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    error: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    disabled: PropTypes.bool,
    changeDelay: PropTypes.number,
};

const defaultProps = {
    onChange: undefined,
    value: {},
    error: {},
    disabled: false,
    changeDelay: undefined,
};


class FaramGroup extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    api = new FaramGroupApi();

    render() {
        const {
            children,
            value,
            error,
            disabled,
            onChange,
            changeDelay,
        } = this.props;

        this.api.setProps({
            value,
            error,
            disabled,
            onChange,
            changeDelay,
        });

        // Context Provider is pure so we need to pass new object
        // as value everytime.
        const providerValue = { api: this.api };

        return (
            <FormContext.Provider value={providerValue}>
                { children }
            </FormContext.Provider>
        );
    }
}

export default FaramInputElement(FaramGroup);
