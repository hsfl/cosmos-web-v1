import React from 'react';
import PropTypes from 'prop-types';
import { Divider } from 'antd';
import { useSelector } from 'react-redux';

function ChartValues({
  plots,
}) {
  const namespace = useSelector((s) => s.namespace);

  const findPiece = (dataKey) => {
    if (namespace && namespace.neutron1) {
      let piece;
      let pieceName = null;

      Object.entries(namespace.neutron1.values).some(([k, v]) => {
        const contains = v.includes(dataKey);

        if (contains) {
          piece = Number(k);
        }

        return contains;
      });

      Object.entries(namespace.neutron1.pieces).some(([k, v]) => {
        const contains = v === piece;

        if (contains) {
          pieceName = k;
        }

        return contains;
      });

      return pieceName;
    }

    return 'any';
  };

  return (
    <>
      <span className="text-xs">
        {
          plots.length === 0 ? 'No charts to display.' : null
        }
        {
          plots.map((plot, i) => (
            <span key={`${plot.nodeProcess}${plot.YDataKey}`}>
              <span
                className="inline-block rounded-full mr-2 indicator"
                style={
                  {
                    height: '6px',
                    width: '6px',
                    marginBottom: '2px',
                    backgroundColor: plot.marker.color,
                  }
                }
              />
              <span className="font-semibold">
                {
                  findPiece(plot.YDataKey)
                }
              </span>
              &nbsp;-&nbsp;
              {plot.YDataKey}

              {
                plots.length - 1 === i ? null : <Divider type="vertical" />
              }
            </span>
          ))
        }
      </span>
    </>
  );
}

ChartValues.propTypes = {
  plots: PropTypes.arrayOf(PropTypes.shape).isRequired,
};

export default ChartValues;
