import PropTypes from 'prop-types';
import React from 'react';

import List from '../List';
import Button from '../../Action/Button';
import iconNames from '../../../constants/iconNames';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    tabs: PropTypes.shape({
        dummy: PropTypes.string,
    }),
    onClick: PropTypes.func,
    active: PropTypes.string,
};

const defaultProps = {
    active: undefined,
    className: '',
    tabs: [],
    onClick: () => {},
};

export default class ScrollTabs extends React.Component {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getClassName = () => {
        const { className } = this.props;

        const classNames = [
            className,
            'scroll-tabs',
        ];

        return classNames.join(' ');
    }

    getTabClassName = (isActive) => {
        const classNames = [
            styles.tab,
            'scroll-tab',
        ];

        if (isActive) {
            classNames.push(styles.active);
            classNames.push('active');
        }

        return classNames.join(' ');
    }

    handleTabClick = (key) => {
        const { onClick } = this.props;
        onClick(key);
    }

    renderTab = (key, data) => {
        const {
            active,
            tabs,
        } = this.props;
        const isActive = data === active;
        const className = this.getTabClassName(isActive);
        const onClick = () => { this.handleTabClick(data); };

        return (
            <button
                onClick={onClick}
                className={className}
                key={data}
            >
                { tabs[data] }
            </button>
        );
    }

    render() {
        const {
            tabs,
        } = this.props;

        const tabList = Object.keys(tabs);
        const leftButtonClassNames = [
            styles['scroll-button'],
            styles['scroll-button-left'],
        ];
        const rightButtonClassNames = [
            styles['scroll-button'],
            styles['scroll-button-right'],
        ];

        return (
            <div className={styles['scroll-tabs']}>
                <Button
                    className={leftButtonClassNames.join(' ')}
                    transparent
                    smallVerticalPadding
                    smallHorizontalPadding
                    onClick={this.handleScrollLeftButtonClick}
                    iconName={iconNames.chevronLeft}
                />
                <List
                    data={tabList}
                    modifier={this.renderTab}
                />
                <div className={styles.void} />
                <Button
                    className={rightButtonClassNames.join(' ')}
                    transparent
                    smallVerticalPadding
                    smallHorizontalPadding
                    onClick={this.handleScrollLeftButtonClick}
                    iconName={iconNames.chevronRight}
                />
            </div>
        );
    }
}
