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
};

const defaultProps = {
    onChange: undefined,
    value: {},
    error: {},
    disabled: false,
};


@FaramElement('input')
export default class FaramGroup extends React.PureComponent {
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
        } = this.props;

        this.api.setProps({
            value,
            error,
            disabled,
            onChange,
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
