import PropTypes from 'prop-types';
import React from 'react';
import { _cs, isTruthy } from '@togglecorp/fujs';

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

    // eslint-disable-next-line react/forbid-prop-types
    highlightColumnKeys: PropTypes.object,
    disabled: PropTypes.bool,
};

const defaultProps = {
    disabled: false,
    className: '',
    onClick: undefined,
    headerModifier: undefined,
    highlightColumnKeys: undefined,
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
            highlightColumnKeys,
            disabled,
        } = this.props;

        const headerContent = headerModifier
            ? headerModifier(header, headers) // FIXME: could be optimized
            : <div>header.label</div>;

        return (
            <Header
                key={key}
                uniqueKey={key}
                onClick={this.handleHeaderClick}
                columnHighlighted={
                    isTruthy(key) && isTruthy(highlightColumnKeys) && highlightColumnKeys[key]
                }
                disabled={disabled}
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
            <thead className={_cs(classNameFromProps, 'thead')}>
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
