import React from 'react';
import PropTypes from 'prop-types';
import memoize from 'memoize-one';
import {
    _cs,
    listToMap,
} from '@togglecorp/fujs';

import FloatingContainer from '../../../View/FloatingContainer';
import ListView from '../../../View/List/ListView';
import Option from '../Option';

import styles from './styles.scss';

const emptyComponent = () => null;

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
    showHint: PropTypes.bool.isRequired,
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

    generateActiveMap = memoize(activeKeys => (
        listToMap(
            activeKeys,
            optionKey => optionKey,
            () => true,
        )
    ))

    renderOption = (k, data) => {
        const {
            keySelector,
            labelSelector,
            onOptionClick,
            onOptionFocus,
            optionLabelSelector,
            focusedKey,
            activeKeys,
        } = this.props;

        const key = keySelector(data);
        const label = optionLabelSelector ? (
            optionLabelSelector(data)
        ) : (
            labelSelector(data)
        );
        const activeKeysMap = this.generateActiveMap(activeKeys);

        const isActive = !!activeKeysMap[key];
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

    render() {
        const {
            onBlur,
            onInvalidate,
            parentContainer,
            data,
            show,
            className,
            renderEmpty: EmptyComponent,
            showHint,
        } = this.props;

        if (!show) {
            return null;
        }

        return (
            <FloatingContainer
                className={_cs(className, styles.options)}
                onBlur={onBlur}
                onInvalidate={onInvalidate}
                parent={parentContainer}
            >
                <ListView
                    className={styles.list}
                    data={data}
                    modifier={this.renderOption}
                    emptyComponent={emptyComponent}
                />
                {data.length <= 0 && (
                    <div className={_cs('empty', styles.empty)}>
                        <EmptyComponent />
                    </div>
                )}
                {showHint && (
                    <div className={_cs('options-hint', styles.optionsHint)}>
                        Type to Search
                    </div>
                )}
            </FloatingContainer>
        );
    }
}
