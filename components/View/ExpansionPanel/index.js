import React from 'react';
import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    children: PropTypes.node.isRequired,
    expanded: PropTypes.bool,
};

const defaultProps = {
    className: '',
    disabled: false,
    expanded: false,
};

@CSSModules(styles, { allowMultiple: true })
export default class ExpansionPanel extends React.Component {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    state = {
        expanded: false,
    };

    componentWillMount() {
        const { expanded } = this.props;
        this.setState({
            expanded,
        });
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            expanded: nextProps.expanded,
        });
    }

    handleChange = () => {
        const expanded = !this.state.expanded;

        this.setState({
            expanded,
        });
    }

    render() {
        const {
            className,
            children,
        } = this.props;

        const { expanded } = this.state;

        return (
            <div // eslint-disable-line
                className={className}
                onClick={() => this.handleChange()}
            >
                <div className={expanded ? 'expanded' : 'hidden'}>
                    { children }
                </div>
            </div>
        );
    }
}
