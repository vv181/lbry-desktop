import { connect } from 'react-redux';
import { selectSubscriptions } from 'redux/selectors/subscriptions';
import { selectFollowedTags } from 'lbry-redux';
import SideBar from './view';

const select = state => ({
  subscriptions: selectSubscriptions(state),
  followedTags: selectFollowedTags(state),
});

const perform = () => ({});

export default connect(
  select,
  perform
)(SideBar);
