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

    render() {
        const { children } = this.props;

        const {
            value,
            error,
            disabled,
            onChange,
        } = this.props;

        // FIXME: optimize
        // Don't create new instances
        this.api = new ElementGroupApi({
            value,
            error,
            disabled,
            onChange,
        });

        return (
            <FaramContext.Provider value={this.api}>
                { children }
            </FaramContext.Provider>
        );
    }
}
