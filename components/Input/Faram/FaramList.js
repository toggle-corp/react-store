import PropTypes from 'prop-types';
import React from 'react';


import FaramElement from './FaramElement';
import FaramContext from './FaramContext';
import ElementListApi from './apis/ElementListApi';

const propTypes = {
    children: PropTypes.node.isRequired,
    onChange: PropTypes.func,
    value: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    error: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    disabled: PropTypes.bool,
};

const defaultProps = {
    onChange: undefined,
    value: [],
    error: [],
    disabled: false,
};


@FaramElement('input')
export default class FaramList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const { children } = this.props;

        const {
            value,
            error,
            disabled,
            onChange,
        } = this.props;

        // FIXME: optimize
        this.api = new ElementListApi({
            value,
            error,
            disabled,
            onChange,
        });

        return (
            <FaramContext.List.Provider value={this.api}>
                { children }
            </FaramContext.List.Provider>
        );
    }
}
