import React from 'react';
import { useSelector } from 'react-redux';

import BaseComponent from '../BaseComponent';

function QueuedEvents() {
  const queue = useSelector((s) => s.event_queue);
  const mode = useSelector((s) => s.mode);

  return (
    <BaseComponent
      name="Queued Events"
    >
      <pre className={`${mode}-mode-text`}>
        {
          queue
        }
      </pre>
    </BaseComponent>
  );
}

export default QueuedEvents;
