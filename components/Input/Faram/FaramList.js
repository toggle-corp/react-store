import PropTypes from 'prop-types';
import React from 'react';


import FaramElement from './FaramElement';
import FaramContext from './FaramContext';
import ElementListApi from './apis/ElementListApi';

const propTypes = {
    children: PropTypes.node.isRequired,
    onChange: PropTypes.func,
    value: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    error: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    disabled: PropTypes.bool,
};

const defaultProps = {
    onChange: undefined,
    value: [],
    error: {},
    disabled: false,
};


class FaramList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    api = new ElementListApi();

    render() {
        const { children } = this.props;

        const {
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

export default FaramElement('input')(FaramList);
