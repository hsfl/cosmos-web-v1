import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import { Badge, Form, Button } from 'antd';
import { highlight, languages } from 'prismjs/components/prism-core';

import { mjdToUTCString } from '../../utility/time';

import BaseComponent from '../BaseComponent';

/**
 * Retrieves data from a web socket. Displays an event along with the timestamp in a table.
 */
function Activity() {
  /** Get agent list state from the Context */
  const activities = useSelector((s) => s.data.activity);

  /** Packets currently sent in this session */
  const [packets, setPackets] = useState('');
  /** Option to export packets */
  const [exportPackets, setExportPackets] = useState(null);

  /** Handle the packet saving */
  useEffect(() => {
    if (exportPackets !== null) {
      setPackets('');

      let savedPackets = '';

      activities.forEach((packet) => {
        savedPackets = `${savedPackets}\n${packet.activity}`;
      });

      setPackets(savedPackets);
      setExportPackets(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exportPackets]);

  return (
    <BaseComponent
      name="Activity"
      liveOnly
      formItems={(
        <div>
          <Form layout="vertical">
            <Button onClick={() => setExportPackets(true)}>
              Export Packets
            </Button>
          </Form>
          <pre
            className="language-json"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: highlight(
                packets,
                languages.json,
                'json',
              ),
            }}
          />
        </div>
      )}
    >
      {
        !activities || activities.length === 0 ? 'No activities.' : null
      }
      <table>
        <tbody>
          {
            // eslint-disable-next-line camelcase
            activities ? activities.map(({ activity, node_utc }) => (
              // eslint-disable-next-line camelcase
              <tr className="truncate ..." key={node_utc}>
                <td>
                  <Badge status="default" />
                </td>
                <td className="pr-4 text-gray-500">
                  {
                    mjdToUTCString(node_utc)
                  }
                </td>
                <td>
                  {activity}
                </td>
              </tr>
            )) : null
          }
        </tbody>
      </table>
    </BaseComponent>
  );
}

export default Activity;
