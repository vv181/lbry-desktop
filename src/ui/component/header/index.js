import * as SETTINGS from 'constants/settings';
import { connect } from 'react-redux';
import { selectBalance } from 'lbry-redux';
import { formatCredits } from 'util/format-credits';
import { selectIsUpgradeAvailable, selectAutoUpdateDownloaded } from 'redux/selectors/app';
import { doDownloadUpgradeRequested } from 'redux/actions/app';
import { doSetClientSetting } from 'redux/actions/settings';
import { makeSelectClientSetting } from 'redux/selectors/settings';
import Header from './view';

const select = state => ({
  autoUpdateDownloaded: selectAutoUpdateDownloaded(state),
  balance: selectBalance(state),
  isUpgradeAvailable: selectIsUpgradeAvailable(state),
  roundedBalance: formatCredits(selectBalance(state) || 0, 2),
  currentTheme: makeSelectClientSetting(SETTINGS.THEME)(state),
  automaticDarkModeEnabled: makeSelectClientSetting(SETTINGS.AUTOMATIC_DARK_MODE_ENABLED)(state),
});

const perform = dispatch => ({
  downloadUpgradeRequested: () => dispatch(doDownloadUpgradeRequested()),
  setClientSetting: (key, value) => dispatch(doSetClientSetting(key, value)),
});

export default connect(
  select,
  perform
)(Header);
