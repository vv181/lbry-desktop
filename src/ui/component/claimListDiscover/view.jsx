// @flow
import type { Node } from 'react';
import React, { useEffect, useState } from 'react';
import moment from 'moment';
import usePersistedState from 'util/use-persisted-state';
import { MATURE_TAGS } from 'lbry-redux';
import { withRouter } from 'react-router';
import { FormField } from 'component/common/form';
import ClaimList from 'component/claimList';
import Tag from 'component/tag';
import ClaimPreview from 'component/claimPreview';

const PAGE_SIZE = 20;
const TIME_DAY = 'day';
const TIME_WEEK = 'week';
const TIME_MONTH = 'month';
const TIME_YEAR = 'year';
const TIME_ALL = 'all';
const SEARCH_SORT_YOU = 'you';
const SEARCH_SORT_ALL = 'everyone';
const SEARCH_SORT_CHANNELS = 'channels';

const TYPE_TRENDING = 'trending';
const TYPE_TOP = 'top';
const TYPE_NEW = 'new';
const SEARCH_FILTER_TYPES = [SEARCH_SORT_YOU, SEARCH_SORT_CHANNELS, SEARCH_SORT_ALL];
const SEARCH_TYPES = [TYPE_TRENDING, TYPE_TOP, TYPE_NEW];
const SEARCH_TIMES = [TIME_DAY, TIME_WEEK, TIME_MONTH, TIME_YEAR, TIME_ALL];

type Props = {
  uris: Array<string>,
  subscribedChannels: Array<Subscription>,
  doClaimSearch: (number, {}) => void,
  injectedItem: any,
  tags: Array<string>,
  loading: boolean,
  personal: boolean,
  doToggleTagFollow: string => void,
  meta?: Node,
  showNsfw: boolean,
};

function ClaimListDiscover(props: Props) {
  const {
    history,
    location,
    doClaimSearch,
    uris,
    tags,
    loading,
    personalView,
    injectedItem,
    meta,
    subscribedChannels,
    showNsfw,
  } = props;

  const { search, pathname } = location;
  const urlParams = new URLSearchParams(search);
  const personalSort = urlParams.get('sort') || SEARCH_SORT_YOU;
  const typeSort = urlParams.get('type') || TYPE_TRENDING;
  const timeSort = urlParams.get('time') || TIME_WEEK;
  const count = urlParams.get('count') || PAGE_SIZE;

  const toCapitalCase = string => string.charAt(0).toUpperCase() + string.slice(1);
  const tagsString = tags.join(',');
  const channelsIdString = subscribedChannels.map(channel => channel.uri.split('#')[1]).join(',');
  useEffect(() => {
    const options: {
      page_size: number,
      any_tags?: Array<string>,
      order_by?: Array<string>,
      channel_ids?: Array<string>,
      release_time?: string,
      not_tags?: Array<string>,
    } = { page_size: PAGE_SIZE, page: count / PAGE_SIZE };

    const newTags = tagsString.split(',');
    const newChannelIds = channelsIdString.split(',');

    if ((newTags && !personalView) || (newTags && personalView && personalSort === SEARCH_SORT_YOU)) {
      options.any_tags = newTags;
    } else if (personalSort === SEARCH_SORT_CHANNELS) {
      options.channel_ids = newChannelIds;
    }

    if (!showNsfw) {
      options.not_tags = MATURE_TAGS;
    }

    if (typeSort === TYPE_TRENDING) {
      options.order_by = ['trending_global', 'trending_mixed'];
    } else if (typeSort === TYPE_NEW) {
      options.order_by = ['release_time'];
    } else if (typeSort === TYPE_TOP) {
      options.order_by = ['effective_amount'];
      if (timeSort !== TIME_ALL) {
        const time = Math.floor(
          moment()
            .subtract(1, timeSort)
            .unix()
        );
        options.release_time = `>${time}`;
      }
    }

    doClaimSearch(20, options);
  }, [personalView, personalSort, typeSort, timeSort, doClaimSearch, tagsString, channelsIdString, count, showNsfw]);

  function getLabel(type) {
    if (type === SEARCH_SORT_ALL) {
      return __('Everyone');
    }

    return type === SEARCH_SORT_YOU ? __('Tags You Follow') : __('Channels You Follow');
  }

  function handleTypeSort(newTypeSort) {
    history.push(`?type=${newTypeSort}&sort=${personalSort}&time=${timeSort}`);
  }

  function handlePersonalSort(newPersonalSort) {
    history.push(`?type=${personalSort}&sort=${newPersonalSort}&time=${timeSort}`);
  }

  function handleTimeSort(newTimeSort) {
    history.push(`?type=${typeSort}&sort=${personalSort}&time=${newTimeSort}`);
  }

  function handleScrollBottom() {
    history.replace(`?type=${typeSort}&sort=${personalSort}&time=${timeSort}&count=${count + PAGE_SIZE}`);
  }

  const header = (
    <h1 className="card__title--flex">
      <FormField
        className="claim-list__dropdown"
        type="select"
        name="trending_sort"
        value={typeSort}
        onChange={e => handleTypeSort(e.target.value)}
      >
        {SEARCH_TYPES.map(type => (
          <option key={type} value={type}>
            {toCapitalCase(type)}
          </option>
        ))}
      </FormField>
      <span>{__('For')}</span>
      {!personalView && tags && tags.length ? (
        tags.map(tag => <Tag key={tag} name={tag} disabled />)
      ) : (
        <FormField
          type="select"
          name="trending_overview"
          className="claim-list__dropdown"
          value={personalSort}
          onChange={e => {
            handlePersonalSort(e.target.value);
          }}
        >
          {SEARCH_FILTER_TYPES.map(type => (
            <option key={type} value={type}>
              {getLabel(type)}
            </option>
          ))}
        </FormField>
      )}
      {typeSort === 'top' && (
        <FormField
          className="claim-list__dropdown"
          type="select"
          name="trending_time"
          value={timeSort}
          onChange={e => handleTimeSort(e.target.value)}
        >
          {SEARCH_TIMES.map(time => (
            <option key={time} value={time}>
              {/* i18fixme */}
              {time === TIME_DAY && __('Today')}
              {time !== TIME_ALL && time !== TIME_DAY && `${__('This')} ${toCapitalCase(time)}`}
              {time === TIME_ALL && __('All time')}
            </option>
          ))}
        </FormField>
      )}
    </h1>
  );

  return (
    <div className="card">
      {window.location.href}
      <ClaimList
        loading={loading}
        uris={uris}
        injectedItem={personalSort === SEARCH_SORT_YOU && injectedItem}
        header={header}
        headerAltControls={meta}
        onScrollBottom={handleScrollBottom}
        page={PAGE_SIZE / count}
        pageSize={PAGE_SIZE}
      />

      {loading && count > PAGE_SIZE && new Array(PAGE_SIZE).fill(1).map((x, i) => <ClaimPreview key={i} placeholder />)}
    </div>
  );
}

export default withRouter(ClaimListDiscover);
