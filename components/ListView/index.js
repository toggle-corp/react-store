import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';


const propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(
            PropTypes.node,
        ),
        PropTypes.node,
    ]).isRequired,

    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

@CSSModules(styles, { allowMultiple: true })
export default class ListView extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className,
        } = this.props;

        console.log('Rendering ListView');

        return (
            <div
                className={className}
                styleName="list-view"
            >
                { this.props.children }
            </div>
        );
    }
}


export { default as ListItem } from './ListItem';
