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


export default class Headers extends React.Component {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getClassName = (props) => {
        const classNames = [];
        const {
            className,
        } = props;

        // default className for global override
        classNames.push('headers');
        classNames.push(styles.headers);

        // className provided by parent (through className)
        classNames.push(className);

        return classNames.join(' ');
    }

    getHeaderKey = header => header.key;

    handleHeaderClick = (key, e) => {
        const { onClick } = this.props;
        if (onClick) {
            onClick(key, e);
        }
    }

    renderHeader = (key, header) => {
        const {
            headers,
            headerModifier,
        } = this.props;

        const headerContent = headerModifier
            ? headerModifier(header, headers) // FIXME: could be optimized
            : header.label;

        return (
            <Header
                key={key}
                uniqueKey={key}
                onClick={this.handleHeaderClick}
            >
                {headerContent}
            </Header>
        );
    }

    render() {
        const { headers } = this.props;

        const className = this.getClassName(this.props);
        return (
            <thead className={className}>
                <tr>
                    <List
                        data={headers}
                        keyExtractor={this.getHeaderKey}
                        modifier={this.renderHeader}
                    />
                </tr>
            </thead>
        );
    }
}
