import React from 'react';
import { useSelector } from 'react-redux';

import BaseComponent from '../BaseComponent';

function QueuedEvents() {
  const queue = useSelector((s) => s.event_queue);

  return (
    <BaseComponent
      name="Queued Events"
    >
      <pre>
        {
          queue
        }
      </pre>
    </BaseComponent>
  );
}

export default QueuedEvents;
