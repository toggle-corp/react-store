import PropTypes from 'prop-types';
import React from 'react';
import { _cs } from '@togglecorp/fujs';

import List from '../../List';

import Header from './Header';

const propTypes = {
    className: PropTypes.string,

    headers: PropTypes.arrayOf(PropTypes.shape({
        key: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
        ]),
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

        return (
            <thead className={_cs(classNameFromProps, 'header')}>
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
