// @flow
import * as ICONS from 'constants/icons';
import React from 'react';
import classnames from 'classnames';
import Button from 'component/button';

type Props = {
  name: string,
  type?: string,
  onClick?: any => any,
};

export default function Tag(props: Props) {
  const { name, onClick, type = 'link' } = props;

  const clickProps = onClick ? { onClick } : { navigate: `/$/tags?t=${name}` };

  return (
    <Button
      {...clickProps}
      className={classnames('tag', {
        'tag--add': type === 'add',
        'tag--remove': type === 'remove',
      })}
      label={name}
      iconSize={12}
      iconRight={type !== 'link' && (type === 'remove' ? ICONS.CLOSE : ICONS.ADD)}
    />
  );
}
