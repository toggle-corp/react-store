import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

const propTypes = {
    /**
     * required for style override
     */
    className: PropTypes.string,

    initialValue: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),
};

const defaultProps = {
    className: '',
    initialValue: '',
};

@CSSModules(styles, { allowMultiple: true })
export default class TextInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            value: this.props.initialValue,
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            value: nextProps.initialValue,
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
            />
        );
    }
}
