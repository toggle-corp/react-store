import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';
/*
 * iconName is left icon in item
 */
const propTypes = {
    iconName: PropTypes.string,
    onClick: PropTypes.func.isRequired,
    title: PropTypes.string,
};

const defaultProps = {
    iconName: undefined,
    title: '',
};

export default class DropdownItem extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            title,
            iconName,
            onClick,
        } = this.props;

        return (
            <button
                onClick={onClick}
                className={styles['dropdown-item']}
            >
                { iconName &&
                    <i
                        className={styles['icon']}
                        className={iconName}
                    />
                }
                {/* XXX: why is this duplicated */}
                { iconName &&
                    <i className={styles['icon']} />
                }
                <span className={styles['label']}>
                    {title}
                </span>
            </button>
        );
    }
}
