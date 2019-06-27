import React from 'react';
import PropTypes from 'prop-types';
import memoize from 'memoize-one';
import hoistNonReactStatics from 'hoist-non-react-statics';
import ReactWordCloud from 'react-wordcloud';

import Responsive from '../../General/Responsive';

const SizeWrapper = (WrappedComponent) => {
    // eslint-disable-next-line react/prefer-stateless-function
    class ResponsiveElement extends React.Component {
        static propTypes = {
            // eslint-disable-next-line react/forbid-prop-types
            boundingClientRect: PropTypes.object.isRequired,
            className: PropTypes.string,
        };

        static defaultProps = {
            className: '',
        };

        getSize = memoize((width, height) => ([width, height]));

        render() {
            const {
                className,
                boundingClientRect: {
                    width = [],
                    height = [],
                },
                ...otherProps
            } = this.props;

            const size = this.getSize(width, height);

            return (
                <WrappedComponent
                    className={className}
                    minSize={size}
                    size={size}
                    {...otherProps}
                />
            );
        }
    }

    return hoistNonReactStatics(
        ResponsiveElement,
        WrappedComponent,
    );
};

const WordCloud = Responsive(SizeWrapper(ReactWordCloud));
/**
 * react-wordcloud wrapper component
 * see <a href="https://github.com/chrisrzhou/react-wordcloud">react-wordcloud</a>
 */
export default WordCloud;
