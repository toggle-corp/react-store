import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,

    headers: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string,
        }),
    ).isRequired,
};

const defaultProps = {
    className: '',
};


@CSSModules(styles, { allowMultiple: true })
export default class Body extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const className = this.getClassName(props);

        this.state = {
            className,
        };
    }

    componentWillReceiveProps(nextProps) {
        const className = this.getClassName(nextProps);

        this.setState({
            className,
        });
    }

    getClassName = (props) => {
        const classNames = [];
        const {
            className,
        } = props;

        // default className for global override
        classNames.push('table-header');

        // className provided by parent (through styleName)
        classNames.push(className);
    }

    render() {
        const {
            headers,
        } = this.props;

        return (
            <thead className={this.state.className}>
                {
                    headers.map(header => (
                        <th key={header.key}>{header.label}</th>
                    ))
                }
            </thead>
        );
    }
}
