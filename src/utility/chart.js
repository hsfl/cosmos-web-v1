export default function determineLayout(defaultYAxis, dataRevision) {
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
    modebar: {
      orientation: 'v',
    },
    margin: {
      r: 60,
      t: 20,
      b: 15,
    },
    xaxis: {
      autorange: false,
      fixedrange: false,
    },
    yaxis: {
      fixedrange: true,
    },
  };

  if (defaultYAxis) {
    layout.yaxis.range = defaultYAxis;
    layout.yaxis.autorange = false;
  }

  return layout;
}
