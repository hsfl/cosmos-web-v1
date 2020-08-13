import React from 'react';
import PropTypes from 'prop-types';

import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

import { Popover } from 'antd';

function DisplayValuesTable({
  displayValues,
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
                      { dataKey }
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
                <td className={`pr-2 ${percentDifference >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {
                    percentDifference !== undefined ? (
                      <>
                        {
                          percentDifference >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />
                        }
                        <strong>
                          { percentDifference.toFixed(2) }
                          %
                        </strong>
                      </>
                    ) : '-'
                  }
                </td>
                <td className={`pr-2 ${(dataKeyLowerThreshold || dataKeyUpperThreshold) && ((value <= dataKeyLowerThreshold) || (value >= dataKeyUpperThreshold)) ? 'text-red-700' : ''}`}>
                  {
                      value !== undefined
                        ? `${value}${unit}` : '-'
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
};

DisplayValuesTable.defaultProps = {
  displayValues: [],
};

export default DisplayValuesTable;
