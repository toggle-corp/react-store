import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';
import { randomString } from '../../utils/common';

const propTypes = {
    /**
     * Show preview?
     */
    showPreview: PropTypes.bool,

    /**
     * a function that return Promise object
     * which will resolve a preview for give file
     */
    previewExtractor: PropTypes.func,

    className: PropTypes.string,
};

const defaultProps = {
    showPreview: false,
    previewExtractor: undefined,
    className: '',
};

@CSSModules(styles, { allowMultiple: true })
export default class FileInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            files: [],
            preview: undefined,
        };

        this.inputId = randomString();
    }

    handleChange = () => {
        const files = this.fileInput.files;
        if (files.length > 0 && this.props.showPreview) {
            this.props.previewExtractor(files[0]).then((preview) => {
                this.setState({ preview });
            });
        }

        this.setState({
            files,
            preview: undefined,
        });
    }

    render() {
        const {
            showPreview,
            previewExtractor, // eslint-disable-line
            className,
            ...otherProps
        } = this.props;

        const { files, preview } = this.state;

        return (
            <div
                styleName="file-input-wrapper"
                className={className}
            >
                {
                    showPreview && (
                        <div
                            styleName="preview"
                            className="image-input-preview"
                        >
                            {
                                preview ? (
                                    <img
                                        src={preview}
                                        alt="No preview available"
                                    />
                                ) : (
                                    <p>No preview available</p>
                                )
                            }
                        </div>
                    )
                }
                <label htmlFor={this.inputId}>
                    Select an image
                </label>
                <input
                    id={this.inputId}
                    type="file"
                    onChange={this.handleChange}
                    ref={(el) => { this.fileInput = el; }}
                    {...otherProps}
                />
                <p styleName="status">
                    { files.length > 0 ? files[0].name : 'No file choosen' }
                </p>
            </div>
        );
    }
}

export const ImageInput = props => (
    <FileInput
        previewExtractor={file => (
            new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    resolve(e.target.result);
                };
                reader.readAsDataURL(file);
            })
        )}
        accept="image/*"
        {...props}
    />
);
