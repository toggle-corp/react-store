import React from 'react';

import FileInput from './index';

// Separator the preview implementation
const ImageInput = props => (
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
    >
        Select an image
    </FileInput>
);
export default ImageInput;
