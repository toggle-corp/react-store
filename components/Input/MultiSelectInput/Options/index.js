import React from 'react';
import FloatingContainer from '../../../View/FloatingContainer';
import List from '../../../View/List';

import Option from '../Option';
import {
    listToMap,
    isArrayEqual,
} from '../../../../utils/common';

import styles from './styles.scss';

const propTypes = {
};

const defaultProps = {
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


        if (!isArrayEqual(oldActiveKeys, newActiveKeys)) {
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
        } = this.props;

        const key = keySelector(data);
        const label = labelSelector(data);
        const isActive = !!this.activeKeysMap[key];

        return (
            <Option
                key={key}
                optionKey={key}
                optionLabel={label}
                onClick={onOptionClick}
                active={isActive}
            />
        );
    }

    renderEmpty = () => {
        const {
            renderEmpty: EmptyComponent,
            options,
        } = this.props;

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
            </FloatingContainer>
        );
    }
}
