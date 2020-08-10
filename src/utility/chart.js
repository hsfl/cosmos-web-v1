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
    margin: {
      r: 10,
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
