export function determineRange(defaultRange) {
  switch (defaultRange) {
    case 'load':
      return [0, 5];
    case 'temperature':
      return [0, 80];
    case 'percent':
      return [0, 100];
    case 'epsPercent':
      return [40, 100];
    case 'power':
    case 'powerMode':
      return [0, 6];
    default:
      return null;
  }
}

export function determineLayout(defaultRange, dataRevision) {
  const layout = {
    autosize: true,
    uirevision: 0,
    datarevision: dataRevision,
    paper_bgcolor: '#FBFBFB',
    plot_bgcolor: '#FBFBFB',
    showlegend: true,
    legend: {
      orientation: 'h',
      font: {
        color: '#4a5568',
      },
    },
    modebar: {
      orientation: 'v',
    },
    margin: {
      r: 60,
      t: 20,
      b: 15,
    },
    xaxis: {
      tickfont: {
        color: '#000000',
      },
      autorange: false,
      fixedrange: false,
    },
    yaxis: {
      tickfont: {
        color: '#000000',
      },
      fixedrange: true,
    },
  };

  if (defaultRange) {
    layout.yaxis.range = determineRange(defaultRange);
    layout.yaxis.autorange = false;
  }

  return layout;
}
