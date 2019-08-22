import React from 'react';
import PropTypes from 'prop-types';

// NOTE: why this does't use className?
const DefaultRenderer = ({ text }) => (
    <div style={DefaultRenderer.loadingStyle}>
        {text}
    </div>
);
DefaultRenderer.propTypes = {
    text: PropTypes.string,
};
DefaultRenderer.defaultProps = {
    text: undefined,
};
DefaultRenderer.loadingStyle = {
    height: '100%',
    fontSize: '18px',
    color: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
};


const propTypes = {
    load: PropTypes.func.isRequired,
    errorText: PropTypes.string,
    loadingText: PropTypes.string,
    decorator: PropTypes.func,
    renderer: PropTypes.func,
};
const defaultProps = {
    errorText: 'Error while loading page.',
    loadingText: 'Loading...',
    decorator: undefined,
    renderer: DefaultRenderer,
};

// NOTE: Intentionally opted out of PureComponent
class Bundle extends React.Component {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {
            BundledComponent: null,
            failed: false,
        };
    }

    componentDidMount() {
        this.mounted = true;
        const { load } = this.props;
        load()
            .then(this.handleLoad)
            .catch(this.handleLoadError);
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    handleLoad = (BundledComponent) => {
        if (!this.mounted) {
            console.warn('Bundle unmounted while loading Component.');
            return;
        }

        let Component = BundledComponent.default || BundledComponent;
        const { decorator } = this.props;
        if (decorator) {
            Component = decorator(Component);
        }

        this.setState({
            BundledComponent: Component,
        });
    }

    handleLoadError = (err) => {
        if (!this.mounted) {
            console.warn('Bundle unmounted while loading Component.');
            return;
        }
        this.setState({ failed: true });
        console.warn('Bundle load failed.', err);
    }

    render() {
        const {
            load, // eslint-disable-line no-unused-vars, @typescript-eslint/no-unused-vars
            decorator, // eslint-disable-line no-unused-vars, @typescript-eslint/no-unused-vars
            errorText,
            loadingText,
            renderer: Loading,
            ...otherProps
        } = this.props;
        const {
            BundledComponent,
            failed,
        } = this.state;

        if (!BundledComponent) {
            const message = failed ? errorText : loadingText;
            return <Loading text={message} />;
        }

        return <BundledComponent {...otherProps} />;
    }
}

export default Bundle;
