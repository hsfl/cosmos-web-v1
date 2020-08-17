import React, {
  useState, useEffect, useRef,
} from 'react';
import {
  Badge, message, Divider, Collapse, Tag, Tooltip,
} from 'antd';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import { useSelector, useDispatch } from 'react-redux';
import { set, setData } from '../store/actions';

import { socket, axios } from '../api';
// eslint-disable-next-line
import routes from '../routes';

const overflowWrap = {
  overflowWrap: 'break-word',
};

function CEO() {
  const dispatch = useDispatch();
  const namespace = useSelector((state) => state.namespace);
  const mode = useSelector((s) => s.mode);

  /** Store the default page layout in case user wants to switch to it */
  const [, setSocketStatus] = useState('error');
  // Selected piece
  const [selectedPiece, setSelectedPiece] = useState({});
  // Store selected tags
  const [selectedTags, setSelectedTags] = useState({});
  // Last selected tag
  const [lastSelectedTag, setLastSelectedTag] = useState('');
  // Values for currently selected piece
  const [availableValues, setAvailableValues] = useState({});

  // Ref to get current state value, for setTimeout function
  const selectedTagsRef = useRef(selectedTags);
  selectedTagsRef.current = selectedTags;

  const lastSelectedTagRef = useRef(null);

  /** Get socket data from the agent */
  useEffect(() => {
    const live = socket('/live/all');

    /** Get latest data from neutron1_exec */
    live.onmessage = ({ data }) => {
      try {
        const json = JSON.parse(data);

        dispatch(setData(json.node_type, json));
      } catch (err) {
        // console.log(err);
      }
    };

    live.onclose = () => {
      setSocketStatus('error');
    };

    live.onerror = () => {
      setSocketStatus('error');
    };

    live.onopen = () => {
      setSocketStatus('success');
    };

    return () => {
      live.close(1000);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    async function fetchNamespace() {
      try {
        const { data } = await axios.get('/namespace/all');

        dispatch(set('namespace', data));
      } catch (error) {
        message.error(error.message);
      }
    }

    fetchNamespace();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle copying of pieces to clipboard
  const copyPieceName = (node, name) => {
    // Check if it was not selected
    if (!(node in selectedTags && selectedTags[node].includes(name))) {
      // Set text in text area
      setLastSelectedTag(name);

      // Copy text from textarea
      lastSelectedTagRef.current.select();
      document.execCommand('copy');

      // Add to selected array for node
      const nextSelectedTags = {
        ...selectedTags,
        [node]: selectedTags[node] ? [...selectedTags[node], name] : [name],
      };

      setSelectedTags(nextSelectedTags);

      // After 2 sec, remove from array
      setTimeout(() => {
        // To handle closure
        const tags = selectedTagsRef.current;
        const remove = tags[node].filter((t) => t !== name);

        setSelectedTags(remove);
      }, 2000);
    }
  };

  const viewPieceValues = (node, piece, component) => {
    // Add to selected array for node
    const nextSelectedPiece = {
      ...selectedPiece,
      [node]: piece,
    };

    setSelectedPiece(nextSelectedPiece);

    setAvailableValues({
      ...availableValues,
      [node]: namespace[node].values[component],
    });
  };

  return (
    <div className={`${mode}-mode flex flex-wrap mt-5 mx-16 mb-16`}>
      {/* For copying values */}
      <textarea
        className="w-1 h-1 opacity-0"
        ref={lastSelectedTagRef}
        value={lastSelectedTag || ''}
        readOnly
      />
      {
          namespace && !(namespace.length === 0)
            ? Object.entries(namespace).map(([node, { pieces, agents }]) => (
              <div
                className="block shadow overflow-y-auto p-4 m-4 bg-white"
                style={overflowWrap}
                key={node}
              >
                <div>
                  <Badge status="success" />
                  <span className="text-lg font-bold">
                    {node}
                  </span>
                </div>
                <div className="flex-col pl-3 pt-2">
                  <div>
                    <span className="text-gray-500">agents</span>
                    <Divider type="vertical" />
                    {
                      agents && agents.length > 0
                        ? agents.map((agent) => (
                          <span
                            key={agent}
                          >
                            { agent }
                            &nbsp;&nbsp;
                          </span>
                        )) : '-'
                    }
                  </div>
                  <div>
                    <Collapse
                      className="bg-transparent border-0 text-gray-500"
                      bordered={false}
                    >
                      <Collapse.Panel
                        header={`Pieces (${pieces ? Object.keys(pieces).length : 0})`}
                        className="my-2 border-b-0"
                      >
                        <span>
                          <span className="text-gray-500">pieces</span>
                          <Divider type="vertical" />
                        </span>
                        {
                          pieces && Object.keys(pieces).length > 0
                            ? Object.entries(pieces).map(([piece, component]) => (
                              <Tag.CheckableTag
                                checked={
                                    selectedPiece[node]
                                      ? selectedPiece[node].indexOf(piece) > -1
                                      : false
                                  }
                                onChange={() => viewPieceValues(node, piece, component)}
                                key={`${node}:${piece}`}
                              >
                                { piece }
                              </Tag.CheckableTag>
                            )) : '-'
                          }
                        <br />
                        <br />
                        <div>
                          <span>
                            <span className="text-gray-500">values</span>
                            <Divider type="vertical" />
                          </span>
                          {
                            availableValues[node]
                              ? availableValues[node].map((value) => (
                                <Tooltip
                                  visible={
                                    selectedTags[node]
                                      ? selectedTags[node].indexOf(value) > -1
                                      : false
                                  }
                                  title={`Copied ${value}!`}
                                  key={`${node}:${value}`}
                                >
                                  <Tag.CheckableTag
                                    onChange={() => copyPieceName(node, value)}
                                  >
                                    { value }
                                  </Tag.CheckableTag>
                                </Tooltip>
                              ))
                              : '-'
                          }
                        </div>
                      </Collapse.Panel>
                    </Collapse>
                  </div>
                </div>
              </div>
            )) : 'Searching for nodes...'
        }
    </div>
  );
}

export default CEO;
