import React from 'react';
import PropTypes from 'prop-types';

import { Popover, Divider } from 'antd';
import PercentDifference from './PercentDifference';

function DisplayValuesTable({
  displayValues,
  showPercentDifference,
}) {
  return (
    <>
      {
        displayValues.length === 0 ? 'No values to display.' : null
      }
      <table>
        <tbody>
          {
            displayValues.map((
              {
                name,
                nodeProcess,
                dataKey,
                processDataKey,
                secondaryDataKey,
                dataKeyLowerThreshold,
                dataKeyUpperThreshold,
                timeDataKey,
                value,
                percentDifference,
                unit,
                time,
              },
            ) => (
              <tr className="whitespace-no-wrap" key={`${name}${nodeProcess}${dataKey}${timeDataKey}${processDataKey.toString()}${unit}`}>
                <Popover
                  className="cursor-pointer"
                  title={name}
                  trigger="click"
                  placement="left"
                  content={(
                    <>
                      <div className="text-xs text-gray-500">
                        Node
                      </div>
                      { nodeProcess }
                      <div className="text-xs text-gray-500 pt-2">
                        Namespace Key
                      </div>
                      <style>
                        {`
                          .max-width-process {
                            max-width: 200px;
                            background-color: white;
                            font-family: inherit;
                          }
                        `}
                      </style>
                      { dataKey }
                      <div className="text-xs text-gray-500 pt-2">
                        Process Namespace Key
                      </div>
                      <pre className="max-width-process">
                        { processDataKey.toString() }
                      </pre>
                      <div className="text-xs text-gray-500 pt-2">
                        Namespace Time Key
                      </div>
                      { timeDataKey }
                      <div className="text-xs text-gray-500 pt-2">
                        Limits
                      </div>
                      { dataKeyLowerThreshold || '-∞' }
                      &nbsp;
                      &le;&nbsp;
                      x&nbsp;
                      &le;&nbsp;
                      { dataKeyUpperThreshold || '∞' }
                    </>
                  )}
                >
                  <td className="pr-2 text-gray-500 text-right">
                    { name }
                  </td>
                </Popover>
                {
                  showPercentDifference
                  ? (
                    <td className="pr-2">
                      <PercentDifference percentDifference={percentDifference} />
                    </td>
                  )
                  : (null)
                }
                <td className={`pr-2 ${(dataKeyLowerThreshold || dataKeyUpperThreshold) && ((value <= dataKeyLowerThreshold) || (value >= dataKeyUpperThreshold)) ? 'text-red-700' : ''}`}>
                  {
                    value !== undefined
                      ? `${value}${unit}` : '-'
                  }
                  {
                    secondaryDataKey !== undefined ? (
                      <>
                        <Divider type="vertical" />
                        {
                          secondaryDataKey
                        }
                      </>
                    ) : null
                  }
                </td>
                <td className="text-gray-500">
                  { time || '-' }
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </>
  );
}

DisplayValuesTable.propTypes = {
  displayValues: PropTypes.arrayOf(PropTypes.shape),
  showPercentDifference: PropTypes.bool,
};

DisplayValuesTable.defaultProps = {
  displayValues: [],
  showPercentDifference: true,
};

export default DisplayValuesTable;
