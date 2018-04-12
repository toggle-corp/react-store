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
    onChange: () => { console.log('No change callback'); },
    value: {},
    error: {},
    disabled: false,
};


export default class InputGroup extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.inputAPI = new InputAPI();
    }

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

        this.inputAPI.setProps({
            value,
            error,
            disabled,
            onChange,
        });

        return (
            <div className={this.getClassName()}>
                <InputContext.Provider value={this.inputAPI}>
                    { children }
                </InputContext.Provider>
            </div>
        );
    }
}
