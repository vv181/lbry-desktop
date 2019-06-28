// @flow
import React, { useState } from 'react';
import { parseURI } from 'lbry-redux';
import Page from 'component/page';
import SubscribeButton from 'component/subscribeButton';
import ShareButton from 'component/shareButton';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'component/common/tabs';
import { withRouter } from 'react-router';
import { Form, FormField } from 'component/common/form';
import Button from 'component/button';
import { formatLbryUriForWeb } from 'util/uri';
import ChannelContent from 'component/channelContent';
import ChannelAbout from 'component/channelAbout';
import ChannelThumbnail from 'component/channelThumbnail';
import SelectAsset from '../../component/selectAsset/view';
import * as ICONS from 'constants/icons';

const PAGE_VIEW_QUERY = `view`;
const ABOUT_PAGE = `about`;

type Props = {
  uri: string,
  title: ?string,
  amount: number,
  cover: ?string,
  thumbnail: ?string,
  page: number,
  location: { search: string },
  history: { push: string => void },
  match: { params: { attribute: ?string } },
  channelIsMine: boolean,
  description: string,
  website: string,
  email: string,
  balance: number,
  updateChannel: any => void,
  tags: Array<string>,
  locations: Array<string>,
  languages: Array<string>,
};

function ChannelPage(props: Props) {
  const {
    uri,
    title,
    cover,
    history,
    location,
    page,
    channelIsMine,
    description,
    website,
    email,
    thumbnail,
    tags,
    locations,
    languages,
    amount,
    updateChannel,
  } = props;
  const { channelName, claimName, claimId } = parseURI(uri);
  const { search } = location;
  const urlParams = new URLSearchParams(search);
  const currentView = urlParams.get(PAGE_VIEW_QUERY) || undefined;
  // fill this in with sdk data
  const channelParams = {
    website: website,
    email: email,
    languages: languages || [],
    cover: cover,
    description: description,
    locations: locations || [],
    title: title,
    thumbnail: thumbnail,
    tags: tags || [],
    claim_id: claimId,
    amount: amount,
  };

  const [params, setParams] = useState(channelParams);
  const [editing, setEditing] = useState(false);
  const [bidError, setBidError] = useState('');

  const MINIMUM_PUBLISH_BID = 0.00000001;

  // If a user changes tabs, update the url so it stays on the same page if they refresh.
  // We don't want to use links here because we can't animate the tab change and using links
  // would alter the Tab label's role attribute, which should stay role="tab" to work with keyboards/screen readers.
  const tabIndex = currentView === ABOUT_PAGE ? 1 : 0;
  const onTabChange = newTabIndex => {
    let url = formatLbryUriForWeb(uri);
    let search = '?';
    if (newTabIndex !== 0) {
      search += `${PAGE_VIEW_QUERY}=${ABOUT_PAGE}`;
    } else {
      search += `page=${page}`;
    }

    history.push(`${url}${search}`);
  };

  const handleBidChange = (bid: number) => {
    const { balance, amount } = props;
    const totalAvailableBidAmount = parseFloat(amount) + parseFloat(balance);
    setParams({ ...params, amount: bid });
    setBidError('');
    if (bid <= 0.0 || isNaN(bid)) {
      setBidError(__('Deposit cannot be 0'));
    } else if (totalAvailableBidAmount === bid) {
      setBidError(__('Please decrease your deposit to account for transaction fees'));
    } else if (totalAvailableBidAmount < bid) {
      setBidError(__('Deposit cannot be higher than your balance'));
    } else if (bid <= MINIMUM_PUBLISH_BID) {
      setBidError(__('Your deposit must be higher'));
    }
  };

  console.log('PARAMS', params);
  console.log(params.description);
  console.log('title', params.title);
  return (
    <Page>
      <div className="card">
        <header className="channel-cover">
          {!editing && cover && <img className="channel-cover__custom" src={cover} />}
          {editing && <img className="channel-cover__custom" src={params.cover} />}
          {/* component that offers select/upload */}
          <div className="channel__primary-info ">
            {!editing && <ChannelThumbnail className="channel__thumbnail--channel-page" uri={uri} />}
            {editing && (
              <ChannelThumbnail
                className="channel__thumbnail--channel-page"
                uri={uri}
                thumbnailPreview={params.thumbnail}
              />
            )}
            <h1 className="channel__title">
              {title || channelName}
              {channelIsMine && !editing && (
                <Button onClick={() => setEditing(!editing)} icon={ICONS.EDIT} iconSize={49} />
              )}
            </h1>
            <h2 className="channel__url">
              {claimName}
              {claimId && `#${claimId}`}
            </h2>
          </div>
        </header>
        {!editing && (
          <Tabs onChange={onTabChange} index={tabIndex}>
            <TabList className="tabs__list--channel-page">
              <Tab>{__('Content')}</Tab>
              <Tab>{__('About')}</Tab>
              <div className="card__actions">
                <ShareButton uri={uri} />
                <SubscribeButton uri={uri} />
              </div>
            </TabList>

            <TabPanels className="channel__data">
              <TabPanel>
                <ChannelContent uri={uri} />
              </TabPanel>
              <TabPanel>
                <ChannelAbout uri={uri} />
              </TabPanel>
            </TabPanels>
          </Tabs>
        )}
        {editing && (
          <div className={'card--section'}>
            <section>
              <div className={'card__title--flex-between'}>
                <header className="card__header">
                  <h2 className="card__title">{__('Edit')}</h2>
                </header>
                <div>
                  <Button button="primary" label={__('Submit')} onClick={() => updateChannel(params)} />

                  <Button
                    button="link"
                    label={__('Cancel')}
                    onClick={() => {
                      setParams({ ...channelParams });
                      setEditing(!editing);
                    }}
                  />
                </div>
              </div>
              <Form onSubmit={channelParams => updateChannel(channelParams)}>
                <div className="card__content">
                  <SelectAsset
                    onUpdate={v => setParams({ ...params, thumbnail: v })}
                    currentValue={params.thumbnail}
                    assetName={'Thumbnail'}
                    recommended={'(400x400)'}
                  />

                  <SelectAsset
                    onUpdate={v => setParams({ ...params, cover: v })}
                    currentValue={params.cover}
                    assetName={'Cover'}
                    recommended={'(1000x300)'}
                  />

                  <FormField
                    type="text"
                    name="channel_title"
                    label={__('Title')}
                    placeholder={__('Titular Title')}
                    disabled={false}
                    value={params.title}
                    onChange={e => setParams({ ...params, title: e.target.value })}
                  />
                  <FormField
                    className="form-field--price-amount"
                    type="number"
                    name="content_bid"
                    step="any"
                    label={__('Deposit (LBC)')}
                    postfix="LBC"
                    value={params.amount}
                    error={bidError}
                    min="0.0"
                    disabled={false}
                    onChange={event => handleBidChange(parseFloat(event.target.value))}
                    placeholder={0.1}
                    // helper={
                    //   <BidHelpText
                    //     uri={shortUri}
                    //     isResolvingUri={isResolvingUri}
                    //     amountNeededForTakeover={amountNeededForTakeover}
                    //   />
                    // }
                  />

                  <FormField
                    type="text"
                    name="channel_website"
                    label={__('Website')}
                    placeholder={__('aprettygoodsite.com')}
                    disabled={false}
                    value={params.website}
                    onChange={e => setParams({ ...params, website: e.target.value })}
                  />

                  <FormField
                    type="text"
                    name="content_email"
                    label={__('Email')}
                    placeholder={__('yourstruly@example.com')}
                    disabled={false}
                    value={params.email}
                    onChange={e => setParams({ ...params, email: e.target.value })}
                  />

                  <FormField
                    type="markdown"
                    name="content_description"
                    label={__('Description')}
                    placeholder={__('Description of your content')}
                    value={params.description}
                    disabled={false}
                    onChange={text => setParams({ ...params, description: text })}
                  />
                  <div>
                    <Button button="primary" label={__('Submit')} onClick={() => updateChannel(params)} />
                    <Button button="link" label={__('Cancel')} onClick={() => setParams({ ...channelParams })} />
                  </div>
                </div>
              </Form>
            </section>
          </div>
        )}
      </div>
    </Page>
  );
}

export default withRouter(ChannelPage);
