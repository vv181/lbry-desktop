import * as PAGES from 'constants/pages';
import React, { useState, useEffect } from 'react';
import { Route, Redirect, Switch, withRouter } from 'react-router-dom';
import SettingsPage from 'page/settings';
import HelpPage from 'page/help';
import ReportPage from 'page/report';
import AccountPage from 'page/account';
import ShowPage from 'page/show';
import PublishPage from 'page/publish';
import DiscoverPage from 'page/discover';
import RewardsPage from 'page/rewards';
import FileListDownloaded from 'page/fileListDownloaded';
import FileListPublished from 'page/fileListPublished';
import TransactionHistoryPage from 'page/transactionHistory';
import AuthPage from 'page/auth';
import InvitePage from 'page/invite';
import SearchPage from 'page/search';
import LibraryPage from 'page/library';
import WalletPage from 'page/wallet';
import NavigationHistory from 'page/navigationHistory';
import TagsPage from 'page/tags';
import FollowingPage from 'page/following';

// const Scroll = withRouter(function ScrollWrapper(props) {
//   const { history, scroll } = props;
//   const { pathname } = props;
//   console.log('scroll', props);

//   useEffect(() => {
//     // if (length === previousLength) {
//     //   return;
//     // }
//     // setPreviousLength(length);
//     // const wentForward = length > previousLength;
//     // if (wentForward) {
//     //   console.log('went forward, scroll up');
//     //   window.scrollTo(0, 0);
//     // } else {
//     //   console.log('went back');
//     // }
//     // Auto scroll to the top of a window for new pages
//     // The browser will handle scrolling if it needs to, but
//     // for new pages, react-router maintains the current y scroll position
//   }, []);

//   return props.children;
// });

if ('scrollRestoration' in history) {
  // Back off, browser, I got this...
  history.scrollRestoration = 'manual';
}

function AppRouter(props) {
  // console.log(props);

  const { scrollHistory, currentScroll, location } = props;
  const scroll = scrollHistory[scrollHistory.length - 1];
  const path = location.pathname;
  const { pathname, search } = location;
  const [previousUrl, setPreviousUrl] = useState();
  console.log(search);
  const url = `${pathname}${search.replace(/\?page=\d+/, '')}`;
  console.log(url);
  // console.log(scrollHistory);
  useEffect(() => {
    window.scrollTo(0, currentScroll);
  }, [currentScroll, url]);

  return (
    <Switch>
      <Route path="/" exact component={DiscoverPage} />
      <Route path={`/$/${PAGES.DISCOVER}`} exact component={DiscoverPage} />
      <Route path={`/$/${PAGES.AUTH}`} exact component={AuthPage} />
      <Route path={`/$/${PAGES.INVITE}`} exact component={InvitePage} />
      <Route path={`/$/${PAGES.DOWNLOADED}`} exact component={FileListDownloaded} />
      <Route path={`/$/${PAGES.PUBLISHED}`} exact component={FileListPublished} />
      <Route path={`/$/${PAGES.HELP}`} exact component={HelpPage} />
      <Route path={`/$/${PAGES.PUBLISH}`} exact component={PublishPage} />
      <Route path={`/$/${PAGES.REPORT}`} exact component={ReportPage} />
      <Route path={`/$/${PAGES.REWARDS}`} exact component={RewardsPage} />
      <Route path={`/$/${PAGES.SEARCH}`} exact component={SearchPage} />
      <Route path={`/$/${PAGES.SETTINGS}`} exact component={SettingsPage} />
      <Route path={`/$/${PAGES.TRANSACTIONS}`} exact component={TransactionHistoryPage} />
      <Route path={`/$/${PAGES.LIBRARY}`} exact component={LibraryPage} />
      <Route path={`/$/${PAGES.ACCOUNT}`} exact component={AccountPage} />
      <Route path={`/$/${PAGES.LIBRARY}/all`} exact component={NavigationHistory} />
      <Route path={`/$/${PAGES.TAGS}`} exact component={TagsPage} />
      <Route path={`/$/${PAGES.FOLLOWING}`} exact component={FollowingPage} />
      <Route path={`/$/${PAGES.WALLET}`} exact component={WalletPage} />
      {/* Below need to go at the end to make sure we don't match any of our pages first */}
      <Route path="/:claimName" exact component={ShowPage} />
      <Route path="/:claimName/:contentName" exact component={ShowPage} />

      {/* Route not found. Mostly for people typing crazy urls into the url */}
      <Route render={() => <Redirect to="/" />} />
    </Switch>
  );
}

export default withRouter(AppRouter);
