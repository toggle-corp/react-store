import CSSModules from 'react-css-modules';
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

@CSSModules(styles, { allowMultiple: true })
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
                styleName="dropdown-item"
            >
                { iconName &&
                    <i
                        styleName="icon"
                        className={iconName}
                    />
                }
                {/* XXX: why is this duplicated */}
                { iconName &&
                    <i styleName="icon" />
                }
                <span styleName="label">
                    {title}
                </span>
            </button>
        );
    }
}
