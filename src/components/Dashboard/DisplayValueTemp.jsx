<Form.Item
label="Name"
key="nameState"
hasFeedback={form.nameState && form.nameState.touched}
validateStatus={form.nameState && form.nameState.changed ? 'success' : ''}
>
<Input
  placeholder="Name"
  id="nameState"
  onFocus={({ target: { id: item } }) => setForm({
    ...form,
    [item]: {
      ...form[item],
      touched: true,
      changed: false,
    },
  })}
  onChange={({ target: { id: item, value } }) => setForm({
    ...form,
    [item]: {
      ...form[item],
      value,
      changed: false,
    },
  })}
  onBlur={({ target: { id: item, value } }) => {
    setNameState(value);
    setForm({ ...form, [item]: { ...form[item], changed: true } });
  }}
  defaultValue={name}
/>
</Form.Item>

<Collapse
bordered
>
{
  displayValuesState.map((displayValue, i) => (
    <Panel
      header={(
        <span className="text-gray-600">
          <span className="inline-block rounded-full mr-2 indicator" style={{ height: '6px', width: '6px', marginBottom: '2px' }} />
          <strong>
            {displayValue.nodeProcess}
          </strong>
          &nbsp;
          <span>
            {displayValue.name}
          </span>
        </span>
      )}
      key={`${displayValue.nodeProcess}${displayValue.dataKey}`}
      extra={(
        <span
          onClick={(event) => {
            event.stopPropagation();

            setDisplayValuesState(displayValuesState.filter((values, j) => j !== i));
          }}
          onKeyDown={() => {}}
          role="button"
          tabIndex={i}
        >
          X
        </span>
      )}
    >
      <Form.Item
        label="Name"
        key="name"
        hasFeedback={form[i] && form[i].name && form[i].name.touched}
        validateStatus={form[i] && form[i].name && form[i].name.changed ? 'success' : ''}
      >
        <Input
          placeholder="Name"
          id="name"
          onFocus={({ target: { id: item } }) => setForm({
            ...form,
            [i]: {
              ...form[i],
              [item]: {
                ...form[i][item],
                touched: true,
                changed: false,
              },
            },
          })}
          onChange={
            ({ target: { id: item, value } }) => setForm({
              ...form,
              [i]: {
                ...form[i],
                [item]: {
                  ...form[i][item],
                  value,
                  changed: false,
                },
              },
            })
          }
          onBlur={({ target: { id: item, value } }) => {
            displayValuesState[i].name = value;
            setForm({
              ...form,
              [i]: {
                ...form[i],
                [item]: {
                  ...form[i][item],
                  changed: true,
                },
              },
            });
          }}
          defaultValue={displayValue.name}
        />
      </Form.Item>

      <Form.Item
        label="Node Process"
        key="nodeProcess"
        hasFeedback={form[i] && form[i].nodeProcess && form[i].nodeProcess.touched}
        validateStatus={form[i] && form[i].nodeProcess && form[i].nodeProcess.changed ? 'success' : ''}
      >
        <Input
          placeholder="Node Process"
          id="nodeProcess"
          onFocus={({ target: { id: item } }) => setForm({
            ...form,
            [i]: {
              ...form[i],
              [item]: {
                ...form[i][item],
                touched: true,
                changed: false,
              },
            },
          })}
          onChange={({ target: { id: item, value } }) => setForm({
            ...form,
            [i]: {
              ...form[i],
              [item]: {
                ...form[i][item],
                value,
                changed: false,
              },
            },
          })}
          onBlur={({ target: { id: item, value } }) => {
            displayValuesState[i].nodeProcess = value;
            setForm({
              ...form,
              [i]: {
                ...form[i],
                [item]: {
                  ...form[i][item],
                  changed: true,
                },
              },
            });
          }}
          defaultValue={displayValue.nodeProcess}
        />
      </Form.Item>

      <Form.Item
        label="Data Key"
        key="dataKey"
        hasFeedback={form[i] && form[i].dataKey && form[i].dataKey.touched}
        validateStatus={form[i] && form[i].dataKey && form[i].dataKey.changed ? 'success' : ''}
      >
        <Input
          placeholder="Data Key"
          id="dataKey"
          onFocus={({ target: { id: item } }) => setForm({
            ...form,
            [i]: {
              ...form[i],
              [item]: {
                ...form[i][item],
                touched: true,
                changed: false,
              },
            },
          })}
          onChange={({ target: { id: item, value } }) => setForm({
            ...form,
            [i]: {
              ...form[i],
              [item]: {
                ...form[i][item],
                value,
                changed: false,
              },
            },
          })}
          onBlur={({ target: { id: item, value } }) => {
            displayValuesState[i].dataKey = value;
            setForm({
              ...form,
              [i]: {
                ...form[i],
                [item]: {
                  ...form[i][item],
                  changed: true,
                },
              },
            });
          }}
          defaultValue={displayValue.dataKey}
        />
      </Form.Item>

      <Form.Item
        label="Process Data Key"
        key="processDataKey"
        hasFeedback={form[i]
          && form[i].processDataKey
          && form[i].processDataKey.touched}
        validateStatus={form[i] && form[i].processDataKey && form[i].processDataKey.changed ? 'success' : ''}
        help={form[i] && form[i].processDataKey && form[i].processDataKey.help ? form[i].processDataKey.help : 'Define the function body (in JavaScript) here to process the variable "x".'}
      >
        <TextArea
          rows={4}
          placeholder="Process Data Key"
          id="processDataKey"
          onFocus={({ target: { id: item } }) => setForm({
            ...form,
            [i]: {
              ...form[i],
              [item]: {
                ...form[i][item],
                touched: true,
                changed: false,
              },
            },
          })}
          onChange={({ target: { id: item, value } }) => setForm({
            ...form,
            [i]: {
              ...form[i],
              [item]: {
                ...form[i][item],
                value,
                changed: false,
              },
            },
          })}
          onBlur={({ target: { id: item, value } }) => {
            if (value.includes('return')) {
              // eslint-disable-next-line
              displayValuesState[i].processDataKey = new Function('x', value);
              setForm({
                ...form,
                [i]: {
                  ...form[i],
                  [item]: {
                    ...form[i][item],
                    changed: true,
                    help: null,
                  },
                },
              });
            } else {
              setForm({
                ...form,
                [i]: {
                  ...form[i],
                  [item]: {
                    ...form[i][item],
                    changed: false,
                    help: 'You must return at least the variable "x".',
                  },
                },
              });
            }
          }}
          defaultValue={displayValue.processDataKey ? displayValue.processDataKey.toString().replace(/^[^{]*{\s*/, '').replace(/\s*}[^}]*$/, '') : 'return x;'}
        />
      </Form.Item>

      <Form.Item
        label="Unit"
        key="unit"
        hasFeedback={form[i] && form[i].unit && form[i].unit.touched}
        validateStatus={form[i] && form[i].unit && form[i].unit.changed ? 'success' : ''}
      >
        <Input
          placeholder="Unit"
          id="unit"
          onFocus={({ target: { id: item } }) => setForm({
            ...form,
            [i]: {
              ...form[i],
              [item]: {
                ...form[i][item],
                touched: true,
                changed: false,
              },
            },
          })}
          onChange={({ target: { id: item, value } }) => setForm({
            ...form,
            [i]: {
              ...form[i],
              [item]: {
                ...form[i][item],
                value,
                changed: false,
              },
            },
          })}
          onBlur={({ target: { id: item, value } }) => {
            displayValuesState[i].unit = value;
            setForm({
              ...form,
              [i]: {
                ...form[i],
                [item]: {
                  ...form[i][item],
                  changed: true,
                },
              },
            });
          }}

          defaultValue={displayValue.unit}
        />
      </Form.Item>
    </Panel>
  ))
}

{/* Adding a display value */}
<Panel header="Add Value" key="3">
  <Form.Item
    label="Name"
    key="name"
    hasFeedback={form.newChart.name && form.newChart.name.touched}
    validateStatus={form.newChart.name && form.newChart.name.changed ? 'success' : ''}
  >
    <Input
      placeholder="Name"
      id="name"
      onFocus={({ target: { id: item } }) => setForm({
        ...form,
        newChart: {
          ...form.newChart,
          [item]: {
            ...form.newChart[item],
            touched: true,
            changed: false,
          },
        },
      })}
      onChange={({ target: { id: item, value } }) => setForm({
        ...form,
        newChart: {
          ...form.newChart,
          [item]: {
            ...form.newChart[item],
            value,
            changed: false,
          },
        },
      })}
      onBlur={({ target: { id: item } }) => {
        setForm({
          ...form,
          newChart: {
            ...form.newChart,
            [item]: {
              ...form.newChart[item],
              changed: true,
            },
          },
        });
      }}
      value={form.newChart.name ? form.newChart.name.value : ''}
    />
  </Form.Item>

  <Form.Item
    required
    label="Node Process"
    key="nodeProcess"
    hasFeedback={form.newChart.nodeProcess && form.newChart.nodeProcess.touched}
    validateStatus={form.newChart.nodeProcess && form.newChart.nodeProcess.changed ? 'success' : ''}
  >
    <Input
      placeholder="Node Process"
      id="nodeProcess"
      onFocus={({ target: { id: item } }) => setForm({
        ...form,
        newChart: {
          ...form.newChart,
          [item]: {
            ...form.newChart[item],
            touched: true,
            changed: false,
          },
        },
      })}
      onChange={({ target: { id: item, value } }) => setForm({
        ...form,
        newChart: {
          ...form.newChart,
          [item]: {
            ...form.newChart[item],
            value,
            changed: false,
          },
        },
      })}
      onBlur={({ target: { id: item } }) => {
        setForm({
          ...form,
          newChart: {
            ...form.newChart,
            [item]: {
              ...form.newChart[item],
              changed: true,
            },
          },
        });
      }}
      value={form.newChart.nodeProcess ? form.newChart.nodeProcess.value : ''}
    />
  </Form.Item>

  <Form.Item
    required
    label="Data Key"
    key="dataKey"
    hasFeedback={form.newChart.dataKey && form.newChart.dataKey.touched}
    validateStatus={form.newChart.dataKey && form.newChart.dataKey.changed ? 'success' : ''}
    help={form.newChart.dataKey && form.newChart.dataKey.help ? form.newChart.dataKey.help : ''}
  >
    <Input
      placeholder="Data Key"
      id="dataKey"
      onFocus={({ target: { id: item } }) => setForm({
        ...form,
        newChart: {
          ...form.newChart,
          [item]: {
            ...form.newChart[item],
            touched: true,
            changed: false,
          },
        },
      })}
      onChange={({ target: { id: item, value } }) => setForm({
        ...form,
        newChart: {
          ...form.newChart,
          [item]: {
            ...form.newChart[item],
            value,
            changed: false,
          },
        },
      })}
      onBlur={({ target: { id: item } }) => {
        setForm({
          ...form,
          newChart: {
            ...form.newChart,
            [item]: {
              ...form.newChart[item],
              changed: true,
            },
          },
        });
      }}
      value={form.newChart.dataKey ? form.newChart.dataKey.value : ''}
    />
  </Form.Item>

  <Form.Item
    label="Process Data Key"
    key="processDataKey"
    hasFeedback={form.newChart.processDataKey && form.newChart.processDataKey.touched}
    validateStatus={form.newChart.processDataKey && form.newChart.processDataKey.changed ? 'success' : ''}
    help={form.newChart.processDataKey && form.newChart.processDataKey.help ? form.newChart.processDataKey.help : 'Define the function body (in JavaScript) here to process the variable "x".'}
  >
    <TextArea
      rows={4}
      placeholder="Process Data Key"
      id="processDataKey"
      onFocus={({ target: { id: item } }) => setForm({
        ...form,
        newChart: {
          ...form.newChart,
          [item]: {
            ...form.newChart[item],
            touched: true,
            changed: false,
          },
        },
      })}
      onChange={({ target: { id: item, value } }) => setForm({
        ...form,
        newChart: {
          ...form.newChart,
          [item]: {
            ...form.newChart[item],
            value,
            changed: false,
          },
        },
      })}
      onBlur={({ target: { id: item, value } }) => {
        if (value.includes('return')) {
          setForm({
            ...form,
            newChart: {
              ...form.newChart,
              [item]: {
                ...form.newChart[item],
                // eslint-disable-next-line
                value: new Function('x', value),
                changed: true,
                help: null,
              },
            },
          });
        } else {
          setForm({
            ...form,
            newChart: {
              ...form.newChart,
              [item]: {
                ...form.newChart[item],
                changed: false,
                help: 'You must return at least the variable "x".',
              },
            },
          });
        }
      }}
      value={form.newChart.processDataKey && form.newChart.processDataKey.value ? form.newChart.processDataKey.value.toString().replace(/^[^{]*{\s*/, '').replace(/\s*}[^}]*$/, '') : ''}
    />
  </Form.Item>

  <Form.Item
    label="Unit"
    key="unit"
    hasFeedback={form.newChart.unit && form.newChart.unit.touched}
    validateStatus={form.newChart.unit && form.newChart.unit.changed ? 'success' : ''}
  >
    <Input
      placeholder="Unit"
      id="unit"
      onFocus={({ target: { id: item } }) => setForm({
        ...form,
        newChart: {
          ...form.newChart,
          [item]: {
            ...form.newChart[item],
            touched: true,
            changed: false,
          },
        },
      })}
      onChange={({ target: { id: item, value } }) => setForm({
        ...form,
        newChart: {
          ...form.newChart,
          [item]: {
            ...form.newChart[item],
            value,
            changed: false,
          },
        },
      })}
      onBlur={({ target: { id: item } }) => {
        setForm({
          ...form,
          newChart: {
            ...form.newChart,
            [item]: {
              ...form.newChart[item],
              changed: true,
            },
          },
        });
      }}
      value={form.newChart.unit ? form.newChart.unit.value : ''}
    />
  </Form.Item>

  <div className="text-red-500 mb-3">
    {formError}
  </div>

  <Button
    type="dashed"
    block
    onClick={() => {
      if (!form.newChart.nodeProcess || !form.newChart.nodeProcess.value) {
        setFormError('Check the "Node Process" field. It is required.');
        return;
      }

      if (!form.newChart.dataKey || !form.newChart.dataKey.value) {
        setFormError('Check the "Data Key" field. It is required.');
        return;
      }

      setForm({
        ...form,
        newChart: {},
        [displayValuesState.length]: {},
      });

      displayValuesState.push({
        name: form.newChart.name && form.newChart.name.value ? form.newChart.name.value : '',
        nodeProcess: form.newChart.nodeProcess.value,
        dataKey: form.newChart.dataKey.value,
        processDataKey: form.newChart.processDataKey && form.newChart.processDataKey.value && (form.newChart.processDataKey.value.includes('return') || form.newChart.processDataKey.value.includes('=>')) ? form.newChart.processDataKey.value : (x) => x,
        unit: form.newChart.unit && form.newChart.unit.value ? form.newChart.unit.value : '',
      });

      form.newChart.name = {};
      form.newChart.nodeProcess = {};
      form.newChart.dataKey = {};
      form.newChart.processDataKey = {};
      form.newChart.unit = {};

      setFormError('');
    }}
  >
    Add Value
  </Button>
</Panel>
</Collapse>