// @flow
import * as ICONS from 'constants/icons';
import * as MODALS from 'constants/modal_types';
import React from 'react';
import Button from 'component/button';
import ToolTip from 'component/common/tooltip';
import analytics from 'analytics';

type Props = {
  claim: StreamClaim,
  claimIsMine: boolean,
  uri: string,
  downloading: boolean,
  fileInfo: ?{
    written_bytes: number,
    total_bytes: number,
    outpoint: number,
    download_path: string,
    completed: boolean,
    status: string,
  },
  loading: boolean,
  costInfo: ?{},
  restartDownload: (string, number) => void,
  openModal: (id: string, { path: string }) => void,
  purchaseUri: (string, boolean) => void,
  pause: () => void,
};

class FileDownloadLink extends React.PureComponent<Props> {
  componentDidMount() {
    const { fileInfo, uri, restartDownload } = this.props;
    if (
      fileInfo &&
      !fileInfo.completed &&
      fileInfo.status === 'running' &&
      fileInfo.written_bytes !== false &&
      fileInfo.written_bytes < fileInfo.total_bytes
    ) {
      // This calls file list to show the percentage
      restartDownload(uri, fileInfo.outpoint);
    }
  }

  render() {
    const {
      fileInfo,
      downloading,
      uri,
      openModal,
      purchaseUri,
      costInfo,
      loading,
      pause,
      claim,
      claimIsMine,
    } = this.props;

    if (loading || downloading) {
      const progress =
        fileInfo && fileInfo.written_bytes > 0 ? (fileInfo.written_bytes / fileInfo.total_bytes) * 100 : 0;
      const label =
        fileInfo && fileInfo.written_bytes > 0
          ? __('Downloading: ') + progress.toFixed(0) + __('% complete')
          : __('Connecting...');

      return <span className="file-download">{label}</span>;
    } else if ((fileInfo === null && !downloading) || (fileInfo && !fileInfo.download_path)) {
      if (!costInfo) {
        return null;
      }

      return (
        <ToolTip label={__('Save file to your library')}>
          <Button
            button="link"
            icon={ICONS.DOWNLOAD}
            onClick={() => {
              if (!fileInfo) {
                const { name, claim_id: claimId, nout, txid } = claim;
                // // ideally outpoint would exist inside of claim information
                // // we can use it after https://github.com/lbryio/lbry/issues/1306 is addressed
                const outpoint = `${txid}:${nout}`;
                analytics.apiLogView(`${name}#${claimId}`, outpoint, claimId);
              }
              purchaseUri(uri, true);
            }}
          />
        </ToolTip>
      );
    } else if (fileInfo && fileInfo.download_path) {
      return (
        <ToolTip label={__('Open file')}>
          <Button
            button="link"
            icon={ICONS.EXTERNAL}
            onClick={() => {
              pause();
              openModal(MODALS.CONFIRM_EXTERNAL_RESOURCE, { path: fileInfo.download_path, isMine: claimIsMine });
            }}
          />
        </ToolTip>
      );
    }

    return null;
  }
}

export default FileDownloadLink;
