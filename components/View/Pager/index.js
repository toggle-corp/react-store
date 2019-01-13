import PropTypes from 'prop-types';
import React from 'react';

import SelectInput from '../../Input/SelectInput';
import { iconNames } from '../../../constants';

import styles from './styles.scss';

const propTypes = {
    activePage: PropTypes.number,
    className: PropTypes.string,
    itemsCount: PropTypes.number,
    itemTitle: PropTypes.string,
    maxItemsPerPage: PropTypes.number,
    onPageClick: PropTypes.func.isRequired,
    totalCapacity: PropTypes.number,
    onItemsPerPageChange: PropTypes.func,
    options: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    showInfo: PropTypes.bool,
    showItemsPerPageChange: PropTypes.bool,
    disabled: PropTypes.bool,
};

const defaultProps = {
    activePage: 1,
    className: '',
    itemsCount: 0,
    maxItemsPerPage: 10,
    itemTitle: 'items',
    totalCapacity: 7,
    onItemsPerPageChange: () => {},
    options: [
        { label: '25', key: 25 },
        { label: '50', key: 50 },
        { label: '75', key: 75 },
        { label: '100', key: 100 },
    ],
    showInfo: true,
    showItemsPerPageChange: true,
    disabled: false,
};

function range(start, end) {
    const foo = [];
    for (let i = start; i <= end; i += 1) {
        foo.push(i);
    }
    return foo;
}

// FIXME: move to different file
class Side {
    constructor(capacity, demand) {
        this.capacity = capacity;
        this.demand = demand;
        this.excess = this.capacity - this.demand;
    }

    hasShortage() {
        return this.excess < 0;
    }

    increaseCapacity(inc) {
        this.capacity += inc;
        this.excess += inc;
    }

    decreaseCapacity(dec) {
        this.capacity += dec;
        this.excess += dec;
    }

    optimizeCapacity() {
        if (this.excess > 0) {
            this.capacity -= this.excess;
            this.excess = 0;
        }
    }
}

export default class Pager extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    pagination = (totalCapacity, active, total) => {
        const {
            disabled,
            onPageClick,
        } = this.props;
        const oneSideCapacity = (totalCapacity - 1) / 2;
        const startIndex = 1;
        const lastIndex = total;

        // Once upon a time, there were two sides of a town
        // And every year, each got equal amount of ration
        // But, they had a variable demand, and each year it could change
        const right = new Side(oneSideCapacity, active - startIndex);
        const left = new Side(oneSideCapacity, lastIndex - active);

        // So the two sides made a treaty
        // If any of the side had an excess that year and the other side had a shortage,
        // they had to give the excess to the other side
        // Thay way, all the ration would be used
        const leftExcess = left.excess;
        const rightExcess = right.excess;
        if (right.hasShortage() && leftExcess > 0) {
            right.increaseCapacity(leftExcess);
        } else if (left.hasShortage() && right.excess > 0) {
            left.increaseCapacity(rightExcess);
        }

        left.optimizeCapacity();
        right.optimizeCapacity();

        let lst = [
            (
                <button
                    key="prev"
                    onClick={() => onPageClick(active - 1)}
                    type="button"
                    disabled={active - 1 < startIndex || disabled}
                    className={styles.paginateBtn}
                >
                    <span className={iconNames.chevronLeft} />
                </button>
            ),
        ];

        if (right.capacity > 0) {
            if (right.excess >= 0) {
                lst = [
                    ...lst,
                    ...range(startIndex, active - 1).map(this.renderButton),
                ];
            } else {
                lst = [
                    ...lst,
                    this.renderButton(startIndex),
                    this.renderSpan('', '...', 'startTick'),
                    ...range(active - (right.capacity - 2), active - 1).map(this.renderButton),
                ];
            }
        }

        lst = [
            ...lst,
            this.renderSpan(styles.active, active),
        ];

        if (left.capacity > 0) {
            if (left.excess >= 0) {
                lst = [
                    ...lst,
                    ...range(active + 1, lastIndex).map(this.renderButton),
                ];
            } else {
                lst = [
                    ...lst,
                    ...range(active + 1, active + (left.capacity - 2)).map(this.renderButton),
                    this.renderSpan('', '...', 'endTick'),
                    this.renderButton(lastIndex),
                ];
            }
        }

        lst = [
            ...lst,
            (
                <button
                    key="next"
                    type="button"
                    onClick={() => onPageClick(active + 1)}
                    disabled={active + 1 > lastIndex || disabled}
                    className={styles.paginateBtn}
                >
                    <span className={iconNames.chevronRight} />
                </button>
            ),
        ];
        return lst;
    }

    renderSpan = (className, index, key) => (
        <span
            className={`${styles.paginateSpan} ${className}`}
            key={key || index}
        >
            {index}
        </span>
    )

    renderButton = (index) => {
        const {
            onPageClick,
            disabled,
        } = this.props;

        return (
            <button
                key={index}
                type="button"
                onClick={() => onPageClick(index)}
                className={styles.paginateBtn}
                disabled={disabled}
            >
                {index}
            </button>
        );
    }

    render() {
        const {
            activePage: activePageProps,
            className: classNameFromProps,
            itemsCount,
            maxItemsPerPage,
            itemTitle,
            totalCapacity,
            showItemsPerPageChange,
            options,
            onItemsPerPageChange,
            disabled,
            showInfo,
        } = this.props;

        const className = `
            ${classNameFromProps}
            ${styles.pager}
            'pager'
        `;
        const perPageTitle = 'per page';
        const showingTitle = 'Showing';
        const ofTitle = 'of';
        const rangeIndicator = '-';

        // NOTE: activePage can never be 0
        const activePage = Math.max(activePageProps, 1);
        // NOTE: number of pages can never be 0
        const numPages = Math.max(Math.ceil(itemsCount / maxItemsPerPage), 1);

        const offset = (activePage - 1) * maxItemsPerPage;
        const itemsOnPage = Math.min(maxItemsPerPage, itemsCount - offset);

        const currentItemsStart = itemsOnPage > 0 ? offset + 1 : offset;
        const currentItemsEnd = offset + itemsOnPage;

        const pages = this.pagination(totalCapacity, activePage, numPages);

        return (
            <div className={className}>
                { showItemsPerPageChange &&
                    <div className={styles.itemsPerPage}>
                        <SelectInput
                            className={styles.input}
                            hideClearButton
                            showLabel={false}
                            showHintAndError={false}
                            options={options}
                            value={maxItemsPerPage}
                            onChange={onItemsPerPageChange}
                            disabled={disabled}
                        />
                        <div className={styles.perPage}>
                            { perPageTitle }
                        </div>
                    </div>
                }
                { showInfo &&
                    <div className={styles.currentRangeInformation}>
                        <div className={styles.showing}>
                            { showingTitle }
                        </div>
                        <div className={styles.currentItemsStart}>
                            { currentItemsStart }
                        </div>
                        <div className={styles.rangeIndicator}>
                            { rangeIndicator }
                        </div>
                        <div className={styles.currentItemsEnd}>
                            { currentItemsEnd }
                        </div>
                        <div className={styles.itemTitle}>
                            { itemTitle }
                        </div>
                        <div className={styles.of}>
                            { ofTitle }
                        </div>
                        <div className={styles.itemCount}>
                            {itemsCount}
                        </div>
                    </div>
                }
                <div className={styles.pageList}>
                    { pages }
                </div>
            </div>
        );
    }
}
