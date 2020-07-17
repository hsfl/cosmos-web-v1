export default [
  {
    name: 'Activity',
    props: {},
  },
  {
    name: 'AgentList',
    props: {
      node: '',
    },
  },
  {
    name: 'Attitude',
    props: {
      attitudes: [
        {
          name: '',
          nodeProcess: '',
          dataKey: '',
          quaternions: {
            d: {
              x: 0,
              y: 0,
              z: 0,
            },
            w: 0,
          },
          live: true,
        },
      ],
    },
  },
  {
    name: 'Clock',
  },
  {
    name: 'Chart',
    props: {
      name: '',
      XDataKey: '',
      processXDataKey: '',
      plots: [
        {
          x: [],
          y: [],
          type: 'scatter',
          marker: {
            color: 'red',
          },
          name: '1',
          YDataKey: '',
          processYDataKey: 'function(x){return x;}',
          nodeProcess: '',
          live: true,
        },
      ],
    },
  },
  {
    name: 'Commands',
    props: {
      nodes: [],
    },
  },
  {
    name: 'DisplayValue',
    props: {
      name: '',
      displayValues: [
        {
          name: '',
          nodeProcess: '',
          dataKey: '',
          unit: '',
          processDataKey: 'function(x){return x.toFixed(2);}',
        },
      ],
    },
  },
  {
    name: 'Image',
    props: {
      name: '',
      node: '',
    },
  },
  /* {
    name: 'Events',
    props: {},
  }, */
  {
    name: 'Globe',
    props: {
      name: '',
      orbits: [
        {
          name: '',
          modelFileName: '',
          nodeProcess: '',
          dataKey: '',
          live: true,
          position: [], // x, y, z
          orientation: {
            d: {
              x: 0,
              y: 0,
              z: 0,
            },
            w: 0,
          },
        },
      ],
      overlays: [
        {
          markerColor: 'RED',
          geoJson: {
            type: 'Polygon',
            coordinates: [
              [[30, 10], [40, 40], [20, 40], [10, 20], [30, 10]],
            ],
          },
        },
      ],
    },
  },
  {
    name: 'Macro',
  },
  {
    name: 'MASDRCommands',
  },
  {
    name: 'PacketActivity',
    props: {},
  },
  {
    name: 'Replacement',
  },
  /* {
    name: 'SatellitePasses',
    props: {},
  },
  {
    name: 'SetValues',
    props: {
      name: 'Set Values',
      node: '',
      proc: '',
      values: {
        node: 'masdr',
        proc: 'nordiasoft',
        values: {
          AX25Framer: [
            'DESTINATION_CALL_SIGN',
            'SOURCE_CALL_SIGN',
          ],
          Descrambler: [
            'DESCRAMBLER_PROPERTIES:LENGTH',
            'DESCRAMBLER_PROPERTIES:MASK',
            'DESCRAMBLER_PROPERTIES:SEED',
          ],
          GmskDemodulator: [
            'bandwidth',
            'samplesPerSymbol',
            'symbolsDelay',
          ],
          GmskModulator: [
            'bandwidth',
            'samplesPerSymbol',
            'symbolsDelay',
          ],
          FirKaiserFilterRx: [
            'cutoffFrequency',
            'samplingFrequency',
            'stopBandAttenuation',
            'transitionBand',
          ],
          FirKaiserFilterTx: [
            'cutoffFrequency',
            'samplingFrequency',
            'stopBandAttenuation',
            'transitionBand',
          ],
          HDLCEncoder: [
            'HDLC_ENCODER_PROPERTIES:PREAMBLE_LENGTH',
            'HDLC_ENCODER_PROPERTIES:POSTAMBLE_LENGTH',
            'HDLC_ENCODER_PROPERTIES:WAVEFORM',
          ],
          MultiStageArbResamplerRx: [
            'resamplingRate',
            'stopBandAttentuation',
          ],
          MultiStageArbResamplerTx: [
            'resamplingRate',
            'stopBandAttentuation',
          ],
          NcoMixerRx: [
            'dopplerFrequency',
            'offsetFrequency',
            'samplingFrequency',
          ],
          NcoMixerTx: [
            'dopplerFrequency',
            'offsetFrequency',
            'samplingFrequency',
          ],
          ParseAX25new: [
            'PARSEAX25_PROPERTIES:RXWAVEFORM',
          ],
          RepackBits: [
            'REPACK_BITS_PROPERTIES:BITS_PER_INPUT_BYTE',
            'REPACK_BITS_PROPERTIES:BITS_PER_OUTPUT_BYTE',
            'REPACK_BITS_PROPERTIES:ENDIANNESS',
          ],
          UnpackBits: [
            'REPACK_BITS_PROPERTIES:BITS_PER_INPUT_BYTE',
            'REPACK_BITS_PROPERTIES:BITS_PER_OUTPUT_BYTE',
            'REPACK_BITS_PROPERTIES:ENDIANNESS',
          ],
          UnpackBits2: [
            'REPACK_BITS_PROPERTIES:BITS_PER_INPUT_BYTE',
            'REPACK_BITS_PROPERTIES:BITS_PER_OUTPUT_BYTE',
            'REPACK_BITS_PROPERTIES:ENDIANNESS',
          ],
          USRP_UHD_Device: [
            'RF_MODE',
            'TX_CENTER_FREQUENCY',
            'TX_HARDWARE_SAMPLE_RATE',
            'TX_GAIN',
            'TX_ANTENNA',
            'RX_BUFFER_SIZE',
            'RX_CENTER_FREQUENCY',
            'RX_HARDWARE_SAMPLE_RATE',
            'RX_GAIN',
            'RX_ANTENNA',
          ],
          USRP_Device_Rx: [
            'RF_MODE',
            'TX_CENTER_FREQUENCY',
            'TX_HARDWARE_SAMPLE_RATE',
            'TX_GAIN',
            'TX_ANTENNA',
            'RX_BUFFER_SIZE',
            'RX_CENTER_FREQUENCY',
            'RX_HARDWARE_SAMPLE_RATE',
            'RX_GAIN',
            'RX_ANTENNA',
          ],
          USRP_Device_Tx: [
            'RF_MODE',
            'TX_CENTER_FREQUENCY',
            'TX_HARDWARE_SAMPLE_RATE',
            'TX_GAIN',
            'TX_ANTENNA',
            'RX_BUFFER_SIZE',
            'RX_CENTER_FREQUENCY',
            'RX_HARDWARE_SAMPLE_RATE',
            'RX_GAIN',
            'RX_ANTENNA',
          ],
        },
      },
    },
  }, */
  {
    name: 'Sequence',
    props: {
      sequences: [
        {
          button: 'Initialize Nordiasoft',
          sequence: [
            'masdr nordiasoft initialize',
            'masdr nordiasoft app_install ~/runtime_propcube_loopback/PropCubeWaveform',
            'masdr nordiasoft list_applications',
            'masdr nordiasoft app_launch PropCubeWaveform',
            'masdr nordiasoft app_start PropCubeWaveform',
          ],
        },
        {
          button: 'Shutdown Nordiasoft',
          sequence: [
            'masdr nordiasoft app_stop PropCubeWaveform',
            'masdr nordiasoft app_uninstall PropCubeWaveform',
            'masdr nordiasoft app_shutdown PropCubeWaveform',
          ],
        },
      ],
    },
  },
  {
    name: 'SOH',
    props: {
      name: '',
    },
  },
  /* {
    name: 'Subsystem',
    props: {},
  },
  {
    name: 'ThreeD',
    props: {},
  }, */
  {
    name: 'UploadFile',
    props: {},
  },
];
