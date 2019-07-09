// @flow
import type { ElementRef } from 'react';
import * as PAGES from 'constants/pages';
import React, { Suspense } from 'react';
import classnames from 'classnames';
import analytics from 'analytics';
import LoadingScreen from 'component/common/loading-screen';
import PlayButton from './internal/play-button';
import detectTyping from 'util/detect-typing';

const Player = React.lazy(() =>
  import(
    /* webpackChunkName: "player-legacy" */
    './internal/player'
  )
);

const SPACE_BAR_KEYCODE = 32;

type Props = {
  cancelPlay: () => void,
  fileInfo: FileListItem,
  fileInfoErrors: ?{
    [string]: boolean,
  },
  autoplay: boolean,
  isLoading: boolean,
  isDownloading: boolean,
  playingUri: ?string,
  contentType: string,
  changeVolume: number => void,
  volume: number,
  claim: StreamClaim,
  uri: string,
  savePosition: (string, string, number) => void,
  position: ?number,
  className: ?string,
  obscureNsfw: boolean,
  play: string => void,
  mediaType: string,
  claimRewards: () => void,
  nextFileToPlay: ?string,
  navigate: (string, {}) => void,
  costInfo: ?{ cost: number },
  insufficientCredits: boolean,
  nsfw: boolean,
  thumbnail: ?string,
  isPlayableType: boolean,
  viewerContainer: { current: ElementRef<any> },
};

class FileViewer extends React.PureComponent<Props> {
  constructor() {
    super();
    (this: any).playContent = this.playContent.bind(this);
    (this: any).handleKeyDown = this.handleKeyDown.bind(this);
    (this: any).logTimeToStart = this.logTimeToStart.bind(this);
    (this: any).onFileFinishCb = this.onFileFinishCb.bind(this);
    (this: any).onFileStartCb = undefined;

    // Don't add these variables to state because we don't need to re-render when their values change
    (this: any).startTime = undefined;
    (this: any).playTime = undefined;
  }

  componentDidMount() {
    const { fileInfo } = this.props;
    if (!fileInfo || (fileInfo && (fileInfo.written_bytes === 0 || fileInfo.blobs_completed < 1))) {
      this.onFileStartCb = this.logTimeToStart;
    }

    this.handleAutoplay(this.props);
    window.addEventListener('keydown', this.handleKeyDown);
  }

  componentDidUpdate(prev: Props) {
    const { fileInfo } = this.props;

    if (this.props.uri !== prev.uri) {
      // User just directly navigated to another piece of content
      if (this.startTime && !this.playTime) {
        // They started playing a file but it didn't start streaming
        // Fire the analytics event with the previous file
        this.fireAnalyticsEvent(prev.claim);
      }

      this.startTime = null;
      this.playTime = null;

      // If this new file is already downloaded, remove the startedPlayingCallback
      if (fileInfo && this.onFileStartCb) {
        this.onFileStartCb = null;
      } else if (!fileInfo && !this.onFileStartCb) {
        this.onFileStartCb = this.logTimeToStart;
      }
    }

    if (
      this.props.autoplay !== prev.autoplay ||
      this.props.fileInfo !== prev.fileInfo ||
      this.props.isDownloading !== prev.isDownloading ||
      this.props.playingUri !== prev.playingUri
    ) {
      // suppress autoplay after download error
      if (!this.props.fileInfoErrors || !(this.props.uri in this.props.fileInfoErrors)) {
        this.handleAutoplay(this.props);
      }
    }
  }

  componentWillUnmount() {
    const { claim } = this.props;

    if (this.startTime && !this.playTime) {
      // The user is navigating away before the file started playing, or a play time was never set
      // Currently will not be set for files that don't use render-media
      this.fireAnalyticsEvent(claim);
    }

    this.props.cancelPlay();
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown(event: KeyboardEvent) {
    if (!detectTyping()) {
      if (event.keyCode === SPACE_BAR_KEYCODE) {
        event.preventDefault(); // prevent page scroll
        this.playContent();
      }
    }
  }

  handleAutoplay = (props: Props) => {
    const { autoplay, playingUri, fileInfo, costInfo, isDownloading, uri, nsfw } = props;

    const playable = autoplay && playingUri !== uri && !nsfw;

    if (playable && costInfo && costInfo.cost === 0 && !fileInfo && !isDownloading) {
      this.playContent();
    } else if (
      playable &&
      fileInfo &&
      ((fileInfo.download_path && fileInfo.written_bytes > 0) ||
        (fileInfo.blobs_completed === 0 && fileInfo.status === 'running'))
    ) {
      this.playContent();
    }
  };

  isMediaSame(nextProps: Props) {
    return this.props.fileInfo && nextProps.fileInfo && this.props.fileInfo.outpoint === nextProps.fileInfo.outpoint;
  }

  playableType(): boolean {
    const { mediaType } = this.props;
    return ['audio', 'video', 'image'].indexOf(mediaType) !== -1;
  }

  playContent() {
    const { play, uri, fileInfo, isDownloading, isLoading, insufficientCredits, mediaType } = this.props;

    if (!fileInfo && insufficientCredits) {
      return;
    }

    // @if TARGET='app'
    if (fileInfo || isDownloading || isLoading) {
      // User may have pressed download before clicking play
      this.onFileStartCb = null;
    }

    if (this.onFileStartCb) {
      this.startTime = Date.now();
    }
    // @endif
    // Passing true means saving file to disk, required for any non-streamable types
    if (this.playableType()) {
      play(uri, false);
    } else {
      play(uri, true);
    }
  }

  logTimeToStart() {
    const { claim } = this.props;

    if (this.startTime) {
      this.playTime = Date.now();
      this.fireAnalyticsEvent(claim, this.startTime, this.playTime);
    }
  }

  fireAnalyticsEvent(claim: StreamClaim, startTime: ?number, playTime: ?number) {
    const { claimRewards } = this.props;
    const { name, claim_id: claimId, txid, nout } = claim;

    // ideally outpoint would exist inside of claim information
    // we can use it after https://github.com/lbryio/lbry/issues/1306 is addressed
    const outpoint = `${txid}:${nout}`;

    let timeToStart;
    if (playTime && startTime) {
      timeToStart = playTime - startTime;
    }

    analytics.apiLogView(`${name}#${claimId}`, outpoint, claimId, timeToStart, claimRewards);
  }

  onFileFinishCb() {
    // If a user has `autoplay` enabled, start playing the next file at the top of "related"
    const { autoplay, nextFileToPlay, navigate } = this.props;
    if (autoplay && nextFileToPlay) {
      navigate(PAGES.SHOW, { uri: nextFileToPlay });
    }
  }

  onFileStartCb: ?() => void;
  startTime: ?number;
  playTime: ?number;

  render() {
    const {
      isLoading,
      isDownloading,
      playingUri,
      fileInfo = {},
      contentType,
      changeVolume,
      volume,
      claim,
      uri,
      savePosition,
      position,
      className,
      obscureNsfw,
      mediaType,
      insufficientCredits,
      viewerContainer,
      thumbnail,
      nsfw,
    } = this.props;

    const isPlaying = playingUri === uri;
    let isReadyToPlay = false;
    // @if TARGET='app'
    isReadyToPlay =
      fileInfo && ((fileInfo.download_path && fileInfo.written_bytes > 0) || fileInfo.status === 'running');
    // @endif
    // @if TARGET='web'
    // try to play immediately on web, we don't need to call file_list since we are streaming from reflector
    isReadyToPlay = isPlaying;
    // @endif

    const shouldObscureNsfw = obscureNsfw && nsfw;
    let loadStatusMessage = '';

    if (fileInfo && fileInfo.blobs_completed >= 1 && (!fileInfo.download_path || !fileInfo.written_bytes)) {
      loadStatusMessage = __(
        "It looks like you deleted or moved this file. We're rebuilding it now. It will only take a few seconds."
      );
    } else if (isLoading) {
      loadStatusMessage = __('Loading stream...');
    } else if (isDownloading) {
      loadStatusMessage = __('Requesting stream... not long left now!');
    }

    const layoverClass = classnames('content__cover', {
      'card__media--nsfw': shouldObscureNsfw,
      'card__media--disabled': !fileInfo && insufficientCredits,
    });

    const layoverStyle = !shouldObscureNsfw && thumbnail ? { backgroundImage: `url("${thumbnail}")` } : {};

    return (
      <div className={classnames('video', {}, className)} ref={viewerContainer}>
        {isPlaying && (
          <div className="content__view">
            {!isReadyToPlay ? (
              <div className={layoverClass} style={layoverStyle}>
                <LoadingScreen status={loadStatusMessage} />
              </div>
            ) : (
              <Suspense fallback={<div />}>
                <Player
                  fileName={fileInfo.file_name}
                  poster={thumbnail}
                  downloadPath={fileInfo.download_path}
                  mediaType={mediaType}
                  contentType={contentType}
                  downloadCompleted={fileInfo.completed}
                  fileStatus={fileInfo.status}
                  streamingUrl={fileInfo.streaming_url}
                  claim={claim}
                  uri={uri}
                  playingUri={playingUri}
                  viewerContainer={viewerContainer}
                />
              </Suspense>
            )}
          </div>
        )}
        {!isPlaying && (
          <div role="button" onClick={this.playContent} className={layoverClass} style={layoverStyle}>
            <PlayButton
              play={(e: SyntheticInputEvent<*>) => {
                e.stopPropagation();
                this.playContent();
              }}
              fileInfo={fileInfo}
              uri={uri}
              isLoading={isLoading}
              mediaType={mediaType}
            />
          </div>
        )}
      </div>
    );
  }
}

export default FileViewer;
