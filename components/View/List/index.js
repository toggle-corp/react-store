import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import ListItem from './ListItem';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,

    data: PropTypes.arrayOf(
        PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.shape({
                dummy: PropTypes.string,
            }),
        ]),
    ),

    emptyComponent: PropTypes.node,

    keyExtractor: PropTypes.func.isRequired,

    modifier: PropTypes.func,
};

const defaultProps = {
    className: '',
    data: [],
    emptyComponent: 'Nothing here',
    modifier: undefined,
};

@CSSModules(styles, { allowMultiple: true })
export default class List extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getListItem = (datum, i) => {
        const {
            data,
            keyExtractor,
            modifier,
        } = this.props;

        const key = keyExtractor(datum, i);

        if (modifier) {
            return (
                <div key={key}>
                    { modifier(datum, i, data) }
                </div>
            );
        }

        return (
            <ListItem
                styleName="list-item"
                key={key}
            >
                { datum }
            </ListItem>
        );
    }

    render() {
        const {
            className,
            data,
            emptyComponent,
        } = this.props;

        return (
            <div
                styleName="list"
                className={`list ${className}`}
            >
                { data.map(datum => this.getListItem(datum)) }

                {
                    data.length === 0 && (
                        <p
                            className="empty"
                            styleName="empty"
                        >
                            { emptyComponent }
                        </p>
                    )
                }
            </div>
        );
    }
}

export { default as ListItem } from './ListItem';
