import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import List from '../List';

import Header from './Header';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,

    headers: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string,
        }),
    ).isRequired,

    onClick: PropTypes.func,

    headerModifier: PropTypes.func,
};

const defaultProps = {
    className: '',
    onClick: undefined,
    headerModifier: undefined,
};


@CSSModules(styles, { allowMultiple: true })
export default class Headers extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const className = this.getClassName(props);
        const styleName = this.getStyleName(props);

        this.state = {
            className,
            styleName,
        };
    }

    componentWillReceiveProps(nextProps) {
        const className = this.getClassName(nextProps);
        const styleName = this.getStyleName(nextProps);

        this.setState({
            className,
            styleName,
        });
    }

    getClassName = (props) => {
        const classNames = [];
        const {
            className,
        } = props;

        // default className for global override
        classNames.push('headers');

        // className provided by parent (through styleName)
        classNames.push(className);

        return classNames.join(' ');
    }

    getStyleName = () => {
        const styleNames = [];

        // default className for global override
        styleNames.push('headers');

        return styleNames.join(' ');
    }

    getHeaderKey = header => header.key;

    getHeader = (key, header) => {
        const {
            headers,
            headerModifier,
        } = this.props;

        let headerContent = header.label;

        if (headerModifier) {
            headerContent = headerModifier(header, headers);
        }

        return (
            <Header
                key={key}
                onClick={this.handleHeaderClick}
                uniqueKey={key}
            >
                {headerContent}
            </Header>
        );
    }

    handleHeaderClick = (key, e) => {
        const { onClick } = this.props;
        if (onClick) {
            onClick(key, e);
        }
    }

    render() {
        const {
            headers,
        } = this.props;

        return (
            <thead
                className={this.state.className}
                styleName={this.state.styleName}
            >
                <tr>
                    <List
                        data={headers}
                        keyExtractor={this.getHeaderKey}
                        modifier={this.getHeader}
                    />
                </tr>
            </thead>
        );
    }
}
