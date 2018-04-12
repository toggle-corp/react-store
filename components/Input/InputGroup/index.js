import PropTypes from 'prop-types';
import React from 'react';

import { InputContext, InputAPI } from '../../../utils/input';


const propTypes = {
    className: PropTypes.string,
    children: PropTypes.node.isRequired,
    onChange: PropTypes.func,
    value: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    error: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    disabled: PropTypes.bool,
};

const defaultProps = {
    className: '',
    onChange: undefined,
    value: {},
    error: {},
    disabled: false,
};


export default class InputGroup extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getClassName = () => {
        const { className } = this.props;
        const classNames = [
            className,
            'input-group',
        ];

        return classNames.join(' ');
    }

    render() {
        const {
            children,
            value,
            error,
            disabled,
            onChange,
        } = this.props;

        // Always create new InputAPI so that the context provider
        // is rerendered.
        // As long as children's props themselves remain constant,
        // they wouldn't be rerendered by react.
        // VERIFY THAT IS IS NOT EXPENSIVE !

        const inputAPI = new InputAPI({
            value,
            error,
            disabled,
            onChange,
        });

        return (
            <div className={this.getClassName()}>
                <InputContext.Provider value={inputAPI}>
                    { children }
                </InputContext.Provider>
            </div>
        );
    }
}
