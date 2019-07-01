import React from 'react';
import PropTypes from 'prop-types';
import { listToMap, isListEqual } from '@togglecorp/fujs';

import FloatingContainer from '../../../View/FloatingContainer';
import List from '../../../View/List';
import Option from '../Option';

import styles from './styles.scss';

const propTypes = {
    activeKeys: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    className: PropTypes.string,
    data: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    keySelector: PropTypes.func.isRequired,
    labelSelector: PropTypes.func.isRequired,
    optionLabelSelector: PropTypes.func,
    onBlur: PropTypes.func.isRequired,
    onInvalidate: PropTypes.func.isRequired,
    onOptionClick: PropTypes.func.isRequired,
    onOptionFocus: PropTypes.func.isRequired,
    parentContainer: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    renderEmpty: PropTypes.func,
    show: PropTypes.bool.isRequired,
    focusedKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

const defaultProps = {
    className: '',
    renderEmpty: () => 'No option available',
    parentContainer: undefined,
    focusedKey: undefined,
    optionLabelSelector: undefined,
};

export default class Options extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.generateActiveMap(props);
    }

    componentWillReceiveProps(nextProps) {
        const { activeKeys: oldActiveKeys } = this.props;
        const { activeKeys: newActiveKeys } = nextProps;

        if (!isListEqual(oldActiveKeys, newActiveKeys)) {
            this.generateActiveMap(nextProps);
        }
    }

    getClassName = () => {
        const { className } = this.props;

        const classNames = [
            className,
            styles.options,
        ];

        return classNames.join(' ');
    }

    generateActiveMap = (props) => {
        const { activeKeys } = props;

        this.activeKeysMap = listToMap(
            activeKeys,
            optionKey => optionKey,
            () => true,
        );
    }

    renderOption = (k, data) => {
        const {
            keySelector,
            labelSelector,
            onOptionClick,
            onOptionFocus,
            optionLabelSelector,
            focusedKey,
        } = this.props;

        const key = keySelector(data);
        const label = optionLabelSelector ? (
            optionLabelSelector(data)
        ) : (
            labelSelector(data)
        );
        const isActive = !!this.activeKeysMap[key];
        const isFocused = key === focusedKey;

        return (
            <Option
                key={key}
                optionKey={key}
                optionLabel={label}
                onClick={onOptionClick}
                onFocus={onOptionFocus}
                active={isActive}
                focused={isFocused}
            />
        );
    }

    renderEmpty = () => {
        const {
            renderEmpty: EmptyComponent,
            data,
        } = this.props;

        if (data.length > 0) {
            return null;
        }

        const className = `empty ${styles.empty}`;
        return (
            <div className={className}>
                <EmptyComponent />
            </div>
        );
    }

    render() {
        const {
            onBlur,
            onInvalidate,
            parentContainer,
            data,
            show,
        } = this.props;

        const className = this.getClassName();
        const Empty = this.renderEmpty;

        if (!show) {
            return null;
        }

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
