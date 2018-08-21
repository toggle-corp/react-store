import PropTypes from 'prop-types';
import React from 'react';


import { FaramInputElement } from '../FaramElements';
import FormContext from '../Form/FormContext';

import FaramListApi from './FaramListApi';

const propTypes = {
    children: PropTypes.node,
    onChange: PropTypes.func,
    value: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    error: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    disabled: PropTypes.bool,
    changeDelay: PropTypes.number,
};

const defaultProps = {
    onChange: undefined,
    value: [],
    error: {},
    disabled: false,
    changeDelay: undefined,
    children: null,
};


class FaramList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    api = new FaramListApi();

    render() {
        const { children } = this.props;

        const {
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

export default FaramInputElement(FaramList);
