import PropTypes from 'prop-types';
import React from 'react';

import List from '../../List';

import Header from './Header';

const propTypes = {
    className: PropTypes.string,

    headers: PropTypes.arrayOf(PropTypes.shape({
        key: PropTypes.string,
    })).isRequired,

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

    getClassName = (className) => {
        const classNames = [];

        // default className for global override
        classNames.push('headers');

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
        const {
            headers,
            className: classNameFromProps,
        } = this.props;

        const className = this.getClassName(classNameFromProps);

        return (
            <thead className={className}>
                <tr>
                    <List
                        data={headers}
                        keySelector={this.getHeaderKey}
                        modifier={this.renderHeader}
                    />
                </tr>
            </thead>
        );
    }
}
