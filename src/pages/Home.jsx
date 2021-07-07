import React from 'react';
import { useSelector } from 'react-redux';
import {
  Divider, Row, Col,
} from 'antd';

function Home() {
  const mode = useSelector((s) => s.mode);
  return (
    <div className={`${mode}-mode h-screen`}>
      <div className="text-center p-5 flex items-center justify-center">
        <img className="w-1/6" src="/world.png" alt="World" />
        <div className="flex-col text-left">
          <h1 className={`${mode}-mode ${mode}-mode-bwtext font-mono text-4xl`}>COSMOS Web</h1>
          <p className="text-gray-500">
            Version &nbsp;
            {
              process.env.VERSION
            }
          </p>
          <p className={`${mode}-mode-text`}>
            COSMOS Web extends COSMOS into a user interface to
            allow for interaction with the ecosystem.
          </p>
        </div>
      </div>
      <br />
      <div className="flex-col items-center p-24">
        <Row gutter={16}>
          <Col span={8}>
            <div className={`${mode}-mode-bwtext pl-4 text-lg font-medium`}>CEO</div>
            <Divider className="mt-4" />
            <p className={`${mode}-mode-text pl-4 pr-4`}>
              The COSMOS Executive Operator (CEO) shows the various nodes
              around the network and offers a high level overview of each node.
            </p>
          </Col>
          <Col span={8}>
            <div className={`${mode}-mode-bwtext pl-4 text-lg font-medium`}>Satellites & Ground Stations</div>
            <Divider className="mt-4" />
            <p className={`${mode}-mode-text pl-4 pr-4`}>
              This is a drilled in view of a certain satellite or ground station
              that provides telemetry data in charts, plaintext or visualizations.
            </p>
          </Col>
          <Col span={8}>
            <div className={`${mode}-mode-bwtext pl-4 text-lg font-medium`}>Dashboard Manager</div>
            <Divider className="mt-4" />
            <p className={`${mode}-mode-text pl-4 pr-4`}>
              This is the page where users can configure local layouts (per computer)
              and add components to their liking.
            </p>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default Home;
