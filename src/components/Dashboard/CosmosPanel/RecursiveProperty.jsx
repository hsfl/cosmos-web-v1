import React, { useState } from 'react';
import PropTypes from 'prop-types';

import ExpandableProperty from './ExpandableProperty';

const RecursiveProperty = ({
  data, title, isRoot, name, callBack,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="recursivePropertyContainer">
      <style>
        {`
          .recursivePropertyContainer {
            padding-top: 10px;
            padding-left: 3px;
            margin-left: 10px;
            color: #666;
            font-size: 16px;
          }
          .typeofnamespan {
            opacity: 0;
            padding-left: 16px;
            visibility: hidden;
            transition: opacity 0.7s ease;
          }
          .typeofnamespan.isHovered {
            visibility: visible;
            opacity: 1;
          }
        `}
      </style>
      {
        (data !== undefined && data !== null) ? (
          // A leaf node, base case
          (Object.keys(data).length === 1 && !isRoot) ? (
            <>
              <span
                role="button"
                onClick={() => callBack(name) }
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                {title}
              </span>
              <span className={`typeofnamespan ${isHovered ? 'isHovered' : ''}`}>{ data.type_of_name }</span>
            </>
          ) : (
            // An Object, can click to expand
            <ExpandableProperty
              title={title.toString()}
              expanded={isRoot}
              name={name}
              type={data.type_of_name}
              callBack={callBack}
            >
              {
                Object.keys(data).reduce((acc, key) => {
                  // Don't display the type_of_name
                  if (key === 'type_of_name') {
                    return acc;
                  }

                  // Construct namespace name for child
                  const newName = (isRoot) ? (
                    // Leave out the name of the root
                    key
                  ) : (
                    // Check if key is an integer
                    // (Warning: this can potentially result in some wacky results
                    // depending on the value of key, but it's very fast.
                    // eg: [] [2], [undefined], "", true, false)
                    !Number.isNaN(+key) ? (
                      // Arrays use []
                      `${name}[${key}]`
                    ) : (
                      // Objects use '.' as separators
                      `${name}.${key}`
                    )
                  );

                  // Recursion
                  acc.push(<RecursiveProperty
                    key={newName}
                    data={data[key]}
                    title={key}
                    isRoot={false}
                    name={newName}
                    callBack={callBack}
                  />);

                  // Return accumulator, continue loop
                  return acc;
                }, [])
              }
            </ExpandableProperty>
          )
        ) : (
          // undefined or null value
          <div>no value</div>
        )
      }
    </div>
  );
};

RecursiveProperty.propTypes = {
  /** json formatted data to recurse over */
  data: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.number,
    PropTypes.string,
    PropTypes.shape({}),
    PropTypes.arrayOf(PropTypes.any),
  ]),
  /** Text to be displayed for an entry */
  title: PropTypes.string.isRequired,
  /** Whether this is the root object or not */
  isRoot: PropTypes.bool.isRequired,
  /** The namespace name */
  name: PropTypes.string,
  callBack: PropTypes.func.isRequired,
};

RecursiveProperty.defaultProps = {
  name: undefined,
  data: undefined,
};

export default React.memo(RecursiveProperty);
