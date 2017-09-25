import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

const propTypes = {
    title: PropTypes.string,
    iconName: PropTypes.string,
    onClick: PropTypes.func,
};

const defaultProps = {
    title: '',
    iconName: '',
    onClick: () => {},
};

@CSSModules(styles, { allowMultiple: true })
export default class DropdownItem extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const { title, iconName, onClick } = this.props;

        return (
            <button
                onClick={onClick}
                styleName="dropdown-item"
            >
                { iconName !== '' &&
                    <i
                        styleName="item-icon"
                        className={iconName}
                    />
                }
                { iconName === '' &&
                    <i
                        styleName="item-icon"
                    />
                }
                {title}
            </button>
        );
    }
}
