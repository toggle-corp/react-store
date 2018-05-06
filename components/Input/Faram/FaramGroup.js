import PropTypes from 'prop-types';
import React from 'react';


import FaramElement from './FaramElement';
import FaramContext from './FaramContext';
import ElementGroupApi from './apis/ElementGroupApi';

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

    api = new ElementGroupApi();

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

        return (
            // Context Provider is pure so we need to pass new object
            // as value everytime.
            <FaramContext.Provider value={{ api: this.api }}>
                { children }
            </FaramContext.Provider>
        );
    }
}

export default FaramElement('input')(FaramGroup);
