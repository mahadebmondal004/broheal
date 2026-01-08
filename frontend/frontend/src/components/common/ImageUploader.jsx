import { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const ImageUploader = ({ currentImage, onImageUploaded, label = 'Upload Image' }) => {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(currentImage);
    const [useUrl, setUseUrl] = useState(true);
    const [urlInput, setUrlInput] = useState(currentImage || '');

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }

        try {
            setUploading(true);

            // Create form data
            const formData = new FormData();
            formData.append('image', file);

            // Upload to server
            const response = await api.post('/admin/upload-image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            const imageUrl = response.data.imageUrl;
            setPreview(imageUrl);
            onImageUploaded(imageUrl);
            toast.success('Image uploaded successfully!');
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleUrlSubmit = () => {
        if (urlInput) {
            setPreview(urlInput);
            onImageUploaded(urlInput);
            toast.success('Image URL updated!');
        }
    };

    const clearImage = () => {
        setPreview('');
        setUrlInput('');
        onImageUploaded('');
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium">{label}</label>
                <div className="flex items-center gap-2 text-sm">
                    <button
                        type="button"
                        onClick={() => setUseUrl(true)}
                        className={`px-3 py-1 rounded ${useUrl ? 'bg-primary-100 text-primary-600' : 'text-gray-600'}`}
                    >
                        URL
                    </button>
                    <button
                        type="button"
                        onClick={() => setUseUrl(false)}
                        className={`px-3 py-1 rounded ${!useUrl ? 'bg-primary-100 text-primary-600' : 'text-gray-600'}`}
                    >
                        Upload
                    </button>
                </div>
            </div>

            {/* Preview */}
            {preview && (
                <div className="relative">
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg border"
                    />
                    <button
                        type="button"
                        onClick={clearImage}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* URL Input */}
            {useUrl ? (
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="input flex-1"
                    />
                    <button
                        type="button"
                        onClick={handleUrlSubmit}
                        className="btn-secondary"
                    >
                        Set URL
                    </button>
                </div>
            ) : (
                /* File Upload */
                <div>
                    <label className="block w-full">
                        <div className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${uploading ? 'border-gray-300 bg-gray-50' : 'border-gray-300 hover:border-primary-600 hover:bg-primary-50'
                            }`}>
                            {uploading ? (
                                <div className="flex flex-col items-center gap-2">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                                    <span className="text-sm text-gray-600">Uploading...</span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <Upload className="w-8 h-8 text-gray-400" />
                                    <div>
                                        <span className="text-sm text-primary-600 font-medium">Click to upload</span>
                                        <span className="text-sm text-gray-600"> or drag and drop</span>
                                    </div>
                                    <span className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</span>
                                </div>
                            )}
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            disabled={uploading}
                            className="hidden"
                        />
                    </label>
                </div>
            )}
        </div>
    );
};

export default ImageUploader;
