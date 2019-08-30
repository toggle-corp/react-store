import React from 'react';
import PropTypes from 'prop-types';

import FloatingContainer from '../../../View/FloatingContainer';
import List from '../../../View/List';

import Option from './Option';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    data: PropTypes.arrayOf(PropTypes.object),
    keySelector: PropTypes.func.isRequired,
    labelSelector: PropTypes.func.isRequired,
    optionLabelSelector: PropTypes.func,
    renderEmpty: PropTypes.func,
    onOptionClick: PropTypes.func.isRequired,
    onOptionFocus: PropTypes.func.isRequired,
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),
    focusedKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onBlur: PropTypes.func.isRequired,
    onInvalidate: PropTypes.func.isRequired,

    // eslint-disable-next-line react/forbid-prop-types
    parentContainer: PropTypes.object,
};

const defaultProps = {
    className: '',
    data: [],
    focusedKey: undefined,
    optionLabelSelector: undefined,
    renderEmpty: () => 'No option available',
    value: undefined,
    parentContainer: undefined,
};

export default class Options extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    renderOption = (_, option) => {
        const {
            keySelector,
            labelSelector,
            optionLabelSelector,
            onOptionClick,
            onOptionFocus,
            value,
            focusedKey,
        } = this.props;

        const key = keySelector(option);
        const label = optionLabelSelector ? (
            optionLabelSelector(option)
        ) : (
            labelSelector(option)
        );

        const isActive = key === value;
        const isFocused = key === focusedKey;

        return (
            <Option
                key={key}
                optionKey={key}
                onClick={onOptionClick}
                onFocus={onOptionFocus}
                isActive={isActive}
                isFocused={isFocused}
            >
                { label }
            </Option>
        );
    }

    renderEmpty = () => {
        const {
            data,
            renderEmpty: EmptyComponent,
        } = this.props;

        if (data.length !== 0) {
            return null;
        }

        const className = `
            empty
            ${styles.empty}
        `;

        return (
            <div className={className}>
                <EmptyComponent />
            </div>
        );
    }

    render() {
        const {
            className: classNameFromProps,
            data,
            onBlur,
            onInvalidate,
            parentContainer,
        } = this.props;

        const className = `
            ${classNameFromProps}
            ${styles.options}
            options
        `;

        const Empty = this.renderEmpty;

        return (
            <FloatingContainer
                onBlur={onBlur}
                onInvalidate={onInvalidate}
                parent={parentContainer}
                className={className}
            >
                <List
                    data={data}
                    modifier={this.renderOption}
                />
                <Empty />
            </FloatingContainer>
        );
    }
}
