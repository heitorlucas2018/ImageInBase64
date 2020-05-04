/**
 * 
 * @author Heitor Santos (https://github.com/heitorlucas2018)
 * @version 0.0.1
 * @license Copyright (c) 2020-2020, Heitor Santos, All rights reserved.
 * For licensing, see LICENSE.md or https://github.com/heitorlucas2018/ImageInBase64/blob/master/LICENSE
 * 
 */

'use strict';

(function() {
    var uniqueNameCounter = 0,
        msgType = 'success, warning, abord',
        loadingImage = 'data:image/gif;base64,R0lGODlhDgAOAIAAAAAAAP///yH5BAAAAAAALAAAAAAOAA4AAAIMhI+py+0Po5y02qsKADs=';

    function getUniqueImageFileName(type) {
        var date = new Date(),
            dateParts = [date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()];
        uniqueNameCounter += 1;
        return 'image-' + CKEDITOR.tools.array.map(dateParts, padNumber).join('') + '-' + uniqueNameCounter + '.' + type;
    }
    /**
     * @param type [success|warning|abord]
     */
    function getNotigication(editor, msg,type = 'success') {
    
     var notification1 = new CKEDITOR.plugins.notification( editor, {
        message: msg,
        type: type
        } );
      notification1.show();
    }

    CKEDITOR.plugins.add('ImageInBase64', {
        extraPlugins: 'notification',
        onLoad: function() {
            CKEDITOR.addCss(
                '.cke_upload_uploading img{' +
                'opacity: 0.3' +
                '}'
            );
        },

        isSupportedEnvironment: function() {
            return CKEDITOR.plugins.clipboard.isFileApiSupported;
        },

        init: function(editor) {

            // Define UploadUrl Default
            editor.config.uploadUrl = '/';
            
            // Defined Values for Plugin FileTools
            var fileTools = CKEDITOR.fileTools,
                uploadUrl = fileTools.getUploadUrl(editor.config, 'image');
                console.log(editor.config)

            fileTools.addUploadWidget(editor, 'uploadimage', {
                supportedTypes: /image\/(jpeg|png|gif|bmp)/,
                uploadUrl: uploadUrl,

                fileToElement: function() {
                    var img = new CKEDITOR.dom.element('img');
                    img.setAttribute('src', loadingImage);
                    img.setAttribute('src', loadingImage);
                    return img;
                },

                parts: {
                    img: 'img'
                },

                onUploading: function(upload) {
                    console.log('Up', upload)
                    if (upload.status !== 'uploaded') {
                        upload.status = 'uploaded';
                        this.parts.img.setAttribute('src', upload.data);
                    } else {
                        this.replaceWith('<img src="' + upload.data + '" >');
                    }
                },

                onUploaded: function(upload) {
                    
                    getNotigication(editor,'Arquivo Carregado Com sucesso');

                    console.log('Upliad=>', upload)

                    var $img = this.parts.img.$;

                    this.replaceWith('<img src="' + upload.data + '" >');
                }
            });

            editor.on('paste', function(evt) {
                console.log(evt);
                if (!evt.data.dataValue.match(/<img[\s\S]+data:/i)) {
                    return;
                }
                var data = evt.data,
                    tempDoc = document.implementation.createHTMLDocument(''),
                    temp = new CKEDITOR.dom.element(tempDoc.body),
                    imgs, img, i;

                temp.appendHtml(data.dataValue);

                imgs = temp.find('img');

                for (i = 0; i < imgs.count(); i++) {
                    img = imgs.getItem(i);

                    var imgSrc = img.getAttribute('src'),
                        // Image have to contain src=data:...
                        isDataInSrc = imgSrc && imgSrc.substring(0, 5) == 'data:',
                        isRealObject = img.data('cke-realelement') === null;

                    if (isDataInSrc && isRealObject && !img.data('cke-upload-id') && !img.isReadOnly(1)) {
                        var imgFormat = imgSrc.match(/image\/([a-z]+?);/i),
                            loader;

                        imgFormat = (imgFormat && imgFormat[1]) || 'jpg';

                        loader = editor.uploadRepository.create(imgSrc, getUniqueImageFileName(imgFormat));
                        loader.upload(uploadUrl);

                        fileTools.markElement(img, 'uploadimage', loader.id);

                        //fileTools.bindNotifications(editor, loader);
                    }
                }
                data.dataValue = temp.getHtml();
            });
        }
    });
})();
