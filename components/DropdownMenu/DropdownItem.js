import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import LinkOutsideRouter from '../LinkOutsideRouter';
import styles from './styles.scss';

const propTypes = {
    title: PropTypes.string.isRequired,
    iconName: PropTypes.string,
    linkTo: PropTypes.string.isRequired,
};

const defaultProps = {
    iconName: '',
};

@CSSModules(styles, { allowMultiple: true })
export default class DropdownItem extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const { title, iconName, linkTo } = this.props;


        return (
            <LinkOutsideRouter
                styleName="dropdown-item"
                to={linkTo}
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
            </LinkOutsideRouter>
        );
    }
}
