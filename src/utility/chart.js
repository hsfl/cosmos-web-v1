export function returnDefaultYAxisRange(defaultYAxis) {
  switch (defaultYAxis) {
    case 'temperature':
      return [0, 80];
    case 'load':
      return [0, 5];
    case 'batteryCharge':
      return [0, 110];
    default:
      return null;
  }
}

export function determineLayout(defaultYAxis, dataRevision) {
  const layout = {
    autosize: true,
    uirevision: 0,
    datarevision: dataRevision,
    paper_bgcolor: '#FBFBFB',
    plot_bgcolor: '#FBFBFB',
    showlegend: true,
    legend: {
      orientation: 'h',
    },
    margin: {
      r: 10,
      t: 20,
      b: 15,
    },
    xaxis: {
      fixedrange: false,
    },
    yaxis: {
      fixedrange: true,
    },
  };

  const range = returnDefaultYAxisRange(defaultYAxis);
  if (range) {
    layout.yaxis.range = range;
    layout.yaxis.autorange = false;
  }

  return layout;
}
