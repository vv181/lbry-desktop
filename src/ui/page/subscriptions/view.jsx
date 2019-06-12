// @flow
import * as PAGES from 'constants/pages';
import React, { useEffect } from 'react';
import Page from 'component/page';
import FileList from 'component/fileList';
import Button from 'component/button';

type Props = {
  subscribedChannels: Array<string>, // The channels a user is subscribed to
  subscriptionContent: Array<{ uri: string, ...StreamClaim }>,
  suggestedSubscriptions: Array<{ uri: string }>,
  loading: boolean,
  doFetchMySubscriptions: () => void,
  doFetchRecommendedSubscriptions: () => void,
  location: { search: string },
  history: { push: string => void },
};

export default function SubscriptionsPage(props: Props) {
  const {
    subscriptionContent,
    subscribedChannels,
    doFetchMySubscriptions,
    doFetchRecommendedSubscriptions,
    suggestedSubscriptions,
    loading,
    location,
    history,
  } = props;
  const hasSubscriptions = !!subscribedChannels.length;
  const { search } = location;
  const urlParams = new URLSearchParams(search);
  const viewingSuggestedSubs = urlParams.get('view');

  function onClick() {
    let url = `/$/${PAGES.SUBSCRIPTIONS}`;
    if (!viewingSuggestedSubs) {
      url += '?view=discover';
    }

    history.push(url);
  }

  useEffect(() => {
    doFetchMySubscriptions();
    doFetchRecommendedSubscriptions();
  }, [doFetchMySubscriptions, doFetchRecommendedSubscriptions]);

  return (
    <Page>
      <div className="card">
        <FileList
          loading={loading}
          header={<h1>{viewingSuggestedSubs ? __('Discover New Channels') : __('Latest From Your Subscriptions')}</h1>}
          headerAltControls={
            <Button
              button="alt"
              label={viewingSuggestedSubs ? hasSubscriptions && __('View Your Subscriptions') : __('Find New Channels')}
              onClick={() => onClick()}
            />
          }
          uris={
            viewingSuggestedSubs
              ? suggestedSubscriptions.map(sub => sub.uri)
              : subscriptionContent.map(sub => sub.permanent_url)
          }
        />
      </div>
    </Page>
  );
}
