import PropTypes from 'prop-types';
import React from 'react';
import { FaramListElement } from '@togglecorp/faram';

import { NormalList } from '../index';
import Message from '../../Message';
import styles from './styles.scss';

const defaultEmptyComponent = () => {
    const classNames = [
        'empty',
        styles.empty,
    ];

    return (
        <div className={classNames.join(' ')}>
            <Message>
                Nothing to show.
            </Message>
        </div>
    );
};

const propTypeData = PropTypes.arrayOf(
    PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
        PropTypes.shape({
            dummy: PropTypes.string,
        }),
        PropTypes.array,
    ]),
);

const propTypes = {
    className: PropTypes.string,
    /* data to be iterated and shown as list */
    data: propTypeData,
    /* Component to show when data is empty */
    emptyComponent: PropTypes.func,
    id: PropTypes.string,
};

const defaultProps = {
    className: '',
    data: [],
    emptyComponent: defaultEmptyComponent,
    id: undefined,
};

// eslint-disable-next-line react/prefer-stateless-function
export class NormalListView extends React.Component {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className: classNameFromProps,
            data,
            emptyComponent: EmptyComponent,
            id,
            ...otherProps
        } = this.props;

        if (data.length === 0) {
            const className = `
                ${classNameFromProps}
                ${styles.listView}
                ${styles.listViewEmpty}
                list-view
                list-view-empty
            `;

            if (!EmptyComponent) {
                return null;
            }

            return (
                <div className={className}>
                    <EmptyComponent />
                </div>
            );
        }

        const className = `
            ${classNameFromProps}
            ${styles.listView}
            list-view
        `;

        return (
            <div
                className={className}
                id={id}
            >
                <NormalList
                    data={data}
                    {...otherProps}
                />
            </div>
        );
    }
}

export default FaramListElement(NormalListView);
