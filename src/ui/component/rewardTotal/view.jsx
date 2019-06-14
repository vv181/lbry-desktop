// @flow
import React, { useEffect, useState } from 'react';
import TotalBackground from './total-background.png';

type Props = {
  // unclaimedRewardAmount: number,
  // fetching: boolean,
  // fetchRewards: () => void,
  // fetchRewardedContent: () => void,
};

const getProgress = (elapsed, duration) => Math.min(elapsed / duration, 1);
const easeOut = progress => Math.pow(progress - 1, 5) + 1;

function useTween(duration, onRest) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let start = performance.now();
    let elapsed = 0;
    let frame;

    const tick = now => {
      elapsed = now - start;
      const progress = getProgress(elapsed, duration);
      setValue(easeOut(progress));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        onRest && onRest();
      }
    };

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [duration, onRest]);

  return value;
}

function RewardTotal(props) {
  const { rewards } = props;
  const rewardTotal = rewards.reduce((acc, val) => acc + val.reward_amount, 0);
  const total = useTween(rewardTotal * 50);
  const integer = Math.round(total * rewardTotal);

  return (
    <section className="card  card--section card--reward-total" style={{ backgroundImage: `url(${TotalBackground})` }}>
      <span className="card__title">
        {integer} LBC {__('Earned From Rewards')}
      </span>
    </section>
  );
}

export default RewardTotal;
