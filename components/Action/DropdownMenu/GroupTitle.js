import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

const propTypes = {
    title: PropTypes.string.isRequired,
};

@CSSModules(styles, { allowMultiple: true })
export default class GroupTitle extends React.PureComponent {
    static propTypes = propTypes;

    render() {
        return (
            <div className={styles['group-header']}>
                {this.props.title}
            </div>
        );
    }
}
