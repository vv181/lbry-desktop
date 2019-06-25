// @flow

import React, { useState } from 'react';
import { FormField } from 'component/common/form';
import FileSelector from 'component/common/file-selector';
import Button from 'component/button';

// The following deps are for speech uploader
// import * as MODALS from 'constants/modal_types';
// import { THUMBNAIL_STATUSES } from 'lbry-redux';
// import getMediaType from 'util/get-media-type';
// import ThumbnailMissingImage from './thumbnail-missing.png';
// import ThumbnailBrokenImage from './thumbnail-broken.png';

// const filters = [
//   {
//     name: __('Thumbnail Image'),
//     extensions: ['png', 'jpg', 'jpeg', 'gif'],
//   },
// ];

type Props = {
  assetName: string,
  currentValue: ?string,
  onUpdate: () => void,
  recommended: string,
};

function SelectAsset(props: Props) {
  const { onUpdate, assetName, currentValue, recommended } = props;
  const [assetSource, setAssetSource] = useState('url');

  return (
    <fieldset-section>
      <fieldset-group className="fieldset-group--smushed">
        <FormField
          className="file-list__dropdown"
          type="select"
          name={assetName}
          value={assetSource}
          onChange={e => setAssetSource(e.target.value)}
          label={__(assetName + ' source')}
        >
          <option key={'lmmnop'} value={'url'}>
            URL
          </option>
          <option key={'lmmnopq'} value={'upload'}>
            UPLOAD
          </option>
        </FormField>
        {assetSource === 'upload' && (
          <>
            <FileSelector />
            <Button button="primary">Publish</Button>
          </>
        )}
        {assetSource === 'url' && (
          <>
            <FormField
              type={'text'}
              name={'thumbnail'}
              label={__(assetName + ' ' + recommended)}
              placeholder={__('https://example.com/image.png')}
              disabled={false}
              value={currentValue}
              onChange={e => {
                onUpdate(e);
              }}
            />
          </>
        )}
      </fieldset-group>
    </fieldset-section>
  );
}

export default SelectAsset;
