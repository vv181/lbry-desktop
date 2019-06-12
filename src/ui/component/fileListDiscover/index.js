import { connect } from 'react-redux';
import {
  selectFollowedTags,
  doClaimSearch,
  selectLastClaimSearchUris,
  selectFetchingClaimSearch,
  doToggleTagFollow,
} from 'lbry-redux';
import FileListDiscover from './view';

const select = state => ({
  followedTags: selectFollowedTags(state),
  uris: selectLastClaimSearchUris(state),
  loading: selectFetchingClaimSearch(state),
});

const perform = {
  doClaimSearch,
  doToggleTagFollow,
};

export default connect(
  select,
  perform
)(FileListDiscover);
