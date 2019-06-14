import { connect } from 'react-redux';
import { selectClaimedRewardsByTransactionId } from 'lbryinc';
import { doOpenModal } from 'redux/actions/app';
import {
  selectAllMyClaimsByOutpoint,
  selectSupportsByOutpoint,
  selectTransactionListFilter,
  doSetTransactionListFilter,
  selectIsFetchingTransactions,
} from 'lbry-redux';
import Wallet from './view';

const select = state => ({
  mySupports: selectSupportsByOutpoint(state),
});

const perform = dispatch => ({});

export default connect(
  select,
  perform
)(Wallet);
