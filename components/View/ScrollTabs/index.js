import PropTypes from 'prop-types';
import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Button from '../../Action/Button';
import HashManager from '../../General/HashManager';
import List from '../List';
import iconNames from '../../../constants/iconNames';
import { addClassName } from '../../../utils/common';

import styles from './styles.scss';

const propTypes = {
    active: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    children: PropTypes.node,
    className: PropTypes.string,
    itemClassName: PropTypes.string,
    activeClassName: PropTypes.string,
    defaultHash: PropTypes.string,
    onClick: PropTypes.func,
    replaceHistory: PropTypes.bool,
    tabs: PropTypes.shape({
        dummy: PropTypes.string,
    }),
    useHash: PropTypes.bool,

    renderer: PropTypes.func,
    rendererClassName: PropTypes.string,
    rendererParams: PropTypes.func,

    inverted: PropTypes.bool,
    showBeforeTabs: PropTypes.bool,
    onHashChange: PropTypes.func,
};

const defaultProps = {
    active: undefined,
    children: null,
    className: '',
    itemClassName: '',
    activeClassName: '',
    defaultHash: undefined,
    onClick: () => {},
    replaceHistory: false,
    tabs: {},
    useHash: false,

    renderer: undefined,
    rendererClassName: '',
    rendererParams: undefined,

    inverted: false,
    showBeforeTabs: false,
    onHashChange: undefined,
};


export default class ScrollTabs extends React.Component {
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

    getTabClassName = (isActive, isBasic) => {
        const {
            itemClassName,
            activeClassName,
        } = this.props;

        const classNames = [
            itemClassName,
            styles.tab,
            'scroll-tab',
        ];
        if (isBasic) {
            classNames.push(styles.basicTab);
        } else {
            classNames.push(styles.tab);
        }

        if (isActive) {
            classNames.push(styles.active);
            classNames.push('active');
            classNames.push(activeClassName);
        }

        return classNames.join(' ');
    }

    handleHashChange = (hash) => {
        this.setState({ hash });

        const { onHashChange } = this.props;

        if (onHashChange) {
            onHashChange(hash);
        }
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

    renderTab = (_, data, index) => {
        const {
            active,
            tabs,
            useHash,
            renderer: Renderer,
            rendererClassName,
            rendererParams,
        } = this.props;

        if (!tabs[data]) {
            return null;
        }

        const extraProps = rendererParams
            ? rendererParams(data, tabs[data], index)
            : undefined;

        const onClick = (e) => { this.handleTabClick(data, e); };
        // const otherContent = modifier ? modifier(data, tabs[data], index) : tabs[data];

        if (!useHash) {
            const isActive = data === String(active);

            if (Renderer) {
                const className = this.getTabClassName(isActive, true);
                return (
                    <Renderer
                        key={data}
                        className={_cs(rendererClassName, className)}
                        isActive={isActive}
                        onClick={onClick}
                        {...extraProps}
                    />
                );
            }

            const className = this.getTabClassName(isActive);
            return (
                <button
                    key={data}
                    className={className}
                    onClick={onClick}
                    tabIndex="-1"
                    type="button"
                >
                    {tabs[data]}
                </button>
            );
        }

        const { hash } = this.state;

        const isActive = hash === data;

        if (Renderer) {
            const className = this.getTabClassName(isActive, true);
            return (
                <Renderer
                    key={data}
                    className={_cs(rendererClassName, className)}
                    isActive
                    href={`#/${data}`}
                    onClick={onClick}
                    {...extraProps}
                />
            );
        }

        const className = this.getTabClassName(isActive);
        return (
            <a
                key={data}
                className={className}
                onClick={onClick}
                href={`#/${data}`}
            >
                { tabs[data] }
            </a>
        );
    }

    render() {
        const {
            tabs,
            useHash,
            defaultHash,
            showBeforeTabs,
            children,
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
                    { showBeforeTabs &&
                        <div className={styles.nonBlank}>
                            { children }
                        </div>
                    }
                    <List
                        data={tabList}
                        modifier={this.renderTab}
                    />
                    <div className={styles.blank}>
                        { !showBeforeTabs && children }
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
