import React from 'react';
import classnames from 'classnames';
import WalletBalance from 'component/walletBalance';
import RewardSummary from 'component/rewardSummary';
import TransactionListRecent from 'component/transactionListRecent';
import Page from 'component/page';
import UnsupportedOnWeb from 'component/common/unsupported-on-web';
// import WalletAddress from 'component/walletAddress';
// import WalletSend from 'component/walletSend';
import UserEmail from 'component/userEmail';

const WalletPage = () => (
  <Page>
    {IS_WEB && <UnsupportedOnWeb />}
    <div className={classnames({ 'card--disabled': IS_WEB })}>
      <div className="columns">
        <WalletBalance />
        <RewardSummary />
      </div>
      <TransactionListRecent />
      <UserEmail />
    </div>
  </Page>
);

export default WalletPage;
