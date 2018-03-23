import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

const propTypes = {
    title: PropTypes.string.isRequired,
};

export default class GroupTitle extends React.PureComponent {
    static propTypes = propTypes;

    render() {
        return (
            <div className={styles.groupHeader}>
                {this.props.title}
            </div>
        );
    }
}
