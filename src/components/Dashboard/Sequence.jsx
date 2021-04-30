import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';

import {
  Button, Popover, message,
} from 'antd';
import { QuestionOutlined } from '@ant-design/icons';

import BaseComponent from '../BaseComponent';
import { COSMOSAPI } from '../../api';

/**
 * Component to handle pre-defined sequences of commands to run agent commands.
 */
function Sequence({
  sequences,
}) {
  /** Auto scroll the history log to the bottom */
  const [updateLog, setUpdateLog] = useState(false);
  /** Agent command history (to display in the terminal) */
  const [commandHistory] = useState([]);

  /** DOM Element selector for history log */
  const cliEl = useRef(null);

  const execute = async (sequence) => {
    message.loading('Starting sequence...', 0);

    /** Listen for command outputs and append them to the command history.
     * Force scroll to the bottom.
     */
    await Promise.all(sequence.map(async (command) => {
      try {
        await COSMOSAPI.runCommand({
          command: `${process.env.COSMOS_BIN}/agent ${command}`,
        },
        (data) => {
          // User feedback indicating command just sent
          commandHistory.push(`➜ agent ${command}`);

          // Force scroll to bottom
          setUpdateLog(true);

          // Add to command history for reusing in future
          commandHistory.push(data);

          // Force scroll to bottom
          setUpdateLog(true);
        });
      } catch (error) {
        message.error(error.message);
      }
    }));

    // Destory user indicator that sequence is done.
    message.destroy();

    // Indicate in window that sequence has ended
    commandHistory.push('--- End of sequence. ---');

    // Force scroll to bottom
    setUpdateLog(true);

    // Indicate message that sequence finished
    message.success('Finished sequence.', 5);
  };

  /** Force window to scroll to the bottom of window */
  useEffect(() => {
    cliEl.current.scrollTop = cliEl.current.scrollHeight;
    setUpdateLog(null);
  }, [updateLog]);

  return (
    <BaseComponent
      name="Sequence"
    >
      <div className="flex">
        {
          sequences.map((sequence) => (
            <div
              className="m-1"
              key={sequence.button}
            >
              <Button.Group>
                <Button
                  onClick={() => {
                    execute(sequence.sequence);
                  }}
                >
                  {sequence.button}
                </Button>
                <Popover
                  content={(
                    <div className="font-mono">
                      {
                        sequence.sequence.map((s) => (
                          <div>
                            ➜ agent&nbsp;
                            {s}
                          </div>
                        ))
                      }
                    </div>
                  )}
                  title="Sequence"
                  trigger="click"
                  placement="topLeft"
                >
                  <Button>
                    <QuestionOutlined />
                  </Button>
                </Popover>
              </Button.Group>
            </div>
          ))
        }
      </div>
      <div
        className="m-1 border border-gray-300 rounded mb-2 p-4 bg-white font-mono h-32 max-h-full resize-y overflow-y-auto mt-2"
        ref={cliEl}
      >
        {
          // eslint-disable-next-line
          commandHistory.map((command, i) => (<div key={i}>{ command }</div>))
        }
      </div>
    </BaseComponent>
  );
}

Sequence.propTypes = {
  /** Definition of sequences */
  sequences: PropTypes.arrayOf(
    PropTypes.shape({
      /** Name of sequence to display on button */
      button: PropTypes.string,
      /** Definition of sequence of commands to run on button press */
      sequence: PropTypes.arrayOf(PropTypes.string),
    }),
  ),
};

Sequence.defaultProps = {
  sequences: [],
};

export default Sequence;
