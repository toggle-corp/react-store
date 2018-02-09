import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
    load: PropTypes.func.isRequired,
    errorText: PropTypes.string,
    loadingText: PropTypes.string,
};
const defaultProps = {
    errorText: 'Error while loading page.',
    loadingText: 'Loading...',
};

// NOTE: Intentionally opted out of PureComponent
class Bundle extends React.Component {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static loadingStyle = {
        height: '100%',
        fontSize: '2em',
        color: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    };

    constructor(props) {
        super(props);
        this.state = {
            BundledComponent: null,
            failed: false,
        };
    }

    componentWillMount() {
        this.mounted = true;
        this.props.load()
            .then(this.handleLoad)
            .catch(this.handleLoadError);
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    handleLoad = (BundledComponent) => {
        if (!this.mounted) {
            console.error('Bundle unmounted while loading Component.');
            return;
        }
        this.setState({ BundledComponent: BundledComponent.default || BundledComponent });
    }

    handleLoadError = (err) => {
        if (!this.mounted) {
            console.error('Bundle unmounted while loading Component.');
            return;
        }
        this.setState({ failed: true });
        console.error('Bundle load failed.', err);
    }

    renderLoading = ({ text }) => (
        <div style={Bundle.loadingStyle}>
            {text}
        </div>
    )

    render() {
        const {
            load, // eslint-disable-line no-unused-vars
            errorText,
            loadingText,
            ...otherProps
        } = this.props;
        const { BundledComponent, failed } = this.state;
        const Loading = this.renderLoading;

        if (!BundledComponent) {
            const message = failed ? errorText : loadingText;
            return <Loading text={message} />;
        }

        return <BundledComponent {...otherProps} />;
    }
}

export default Bundle;
