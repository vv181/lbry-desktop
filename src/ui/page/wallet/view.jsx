import React from 'react';
import classnames from 'classnames';
import WalletBalance from 'component/walletBalance';
import WalletSend from 'component/walletSend';
import WalletAddress from 'component/walletAddress';
import TransactionListRecent from 'component/transactionListRecent';
import Page from 'component/page';

const SendReceivePage = ({ mySupports }) => {
  return (
    <Page>
      <WalletBalance />
      <TransactionListRecent />
      <WalletSend />
      <WalletAddress />
    </Page>
  );
};

export default SendReceivePage;
