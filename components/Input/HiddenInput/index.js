import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

const propTypes = {
    /**
     * required for style override
     */
    className: PropTypes.string,

    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),
};

const defaultProps = {
    className: '',
    value: '',
};

@CSSModules(styles, { allowMultiple: true })
export default class TextInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const value = this.props.value || '';
        this.state = {
            value,
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            value: nextProps.value,
        });
    }

    getValue = () => this.state.value;

    render() {
        const {
            className,
        } = this.props;

        const {
            value,
        } = this.state;

        return (
            <input
                styleName="hidden-input"
                className={className}
                value={value}
                readOnly
            />
        );
    }
}
