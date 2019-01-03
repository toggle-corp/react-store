import PropTypes from 'prop-types';
import React from 'react';

import Button from '../../Action/Button';
import HashManager from '../../General/HashManager';
import List from '../List';
import iconNames from '../../../constants/iconNames';
import { addClassName } from '../../../utils/common';

import styles from './styles.scss';

const propTypes = {
    active: PropTypes.string,
    children: PropTypes.node,
    className: PropTypes.string,
    itemClassName: PropTypes.string,
    defaultHash: PropTypes.string,
    onClick: PropTypes.func,
    replaceHistory: PropTypes.bool,
    tabs: PropTypes.shape({
        dummy: PropTypes.string,
    }),
    useHash: PropTypes.bool,
    modifier: PropTypes.func,
    inverted: PropTypes.bool,
};

const defaultProps = {
    active: undefined,
    children: null,
    className: '',
    itemClassName: '',
    defaultHash: undefined,
    onClick: () => {},
    replaceHistory: false,
    tabs: {},
    useHash: false,
    modifier: undefined,
    inverted: false,
};


export default class FixedTabs extends React.Component {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {
            hash: undefined,
        };
        this.tabsContainerRef = React.createRef();
        this.mainContainerRef = React.createRef();
    }

    componentDidMount() {
        const { current: tabsContainer } = this.tabsContainerRef;
        const { current: mainContainer } = this.mainContainerRef;

        if (tabsContainer.scrollWidth > tabsContainer.clientWidth) {
            addClassName(mainContainer, styles.scroll);
        }
    }

    getClassName = () => {
        const {
            className,
            inverted,
        } = this.props;

        const classNames = [
            className,
            'scroll-tabs',
            styles.scrollTabs,
        ];

        if (inverted) {
            classNames.push('inverted');
            classNames.push(styles.inverted);
        }

        return classNames.join(' ');
    }

    getTabClassName = (isActive) => {
        const { itemClassName } = this.props;

        const classNames = [
            itemClassName,
            styles.tab,
            'scroll-tab',
        ];

        if (isActive) {
            classNames.push(styles.active);
            classNames.push('active');
        }

        return classNames.join(' ');
    }

    handleHashChange = (hash) => {
        this.setState({ hash });
    }

    handleTabClick = (key, e) => {
        const {
            onClick,
            useHash,
            replaceHistory,
        } = this.props;

        if (useHash && replaceHistory) {
            window.location.replace(`#/${key}`);
            e.preventDefault();
        }

        onClick(key);
    }

    handleLeftButtonClick = () => {
        const { current: tabsContainer } = this.tabsContainerRef;

        tabsContainer.scrollLeft -= 48;
    }

    handleRightButtonClick = () => {
        const { current: tabsContainer } = this.tabsContainerRef;

        tabsContainer.scrollLeft += 48;
    }

    renderTab = (_, data) => {
        const {
            active,
            tabs,
            useHash,
            modifier,
        } = this.props;

        if (!tabs[data]) {
            return null;
        }

        const onClick = (e) => { this.handleTabClick(data, e); };
        const content = modifier ? modifier(data) : tabs[data];

        if (!useHash) {
            const isActive = data === active;
            const className = this.getTabClassName(isActive);

            return (
                <button
                    onClick={onClick}
                    className={className}
                    key={data}
                    type="button"
                >
                    { content }
                </button>
            );
        }

        const { hash } = this.state;

        const isActive = hash === data;
        const className = this.getTabClassName(isActive);

        return (
            <a
                onClick={onClick}
                href={`#/${data}`}
                className={className}
                key={data}
            >
                { content }
            </a>
        );
    }

    render() {
        const {
            tabs,
            useHash,
            defaultHash,
        } = this.props;

        // FIXME: generate tabList when tabs change
        const tabList = Object.keys(tabs);
        const className = this.getClassName();
        return (
            <div
                ref={this.mainContainerRef}
                className={className}
            >
                <HashManager
                    tabs={tabs}
                    useHash={useHash}
                    defaultHash={defaultHash}
                    onHashChange={this.handleHashChange}
                />
                <Button
                    iconName={iconNames.chevronLeft}
                    transparent
                    className={styles.leftButton}
                    onClick={this.handleLeftButtonClick}
                />
                <div
                    ref={this.tabsContainerRef}
                    className={styles.tabsContainer}
                >
                    <List
                        data={tabList}
                        modifier={this.renderTab}
                    />
                    <div className={styles.blank}>
                        { this.props.children }
                    </div>
                </div>
                <Button
                    iconName={iconNames.chevronRight}
                    transparent
                    className={styles.rightButton}
                    onClick={this.handleRightButtonClick}
                />
            </div>
        );
    }
}
