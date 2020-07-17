import React from 'react';
import PropTypes from 'prop-types';

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
                dataKeyLowerThreshold,
                dataKeyUpperThreshold,
                value,
                unit,
                time,
              },
              i,
            ) => (
              <tr key={JSON.stringify(displayValues[i])}>
                <td className="pr-2 text-gray-500 text-right">
                  { name }
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
