import React from 'react';
import {
  Card,
} from 'antd';
import { SyncOutlined, SwapRightOutlined, LineChartOutlined } from '@ant-design/icons';

const Home = () => (
  <div>
    <div className="text-center p-5 flex items-center justify-center">
      <img className="w-1/6" src="/src/public/world.png" alt="World" />
      <h1 className="font-mono text-4xl">COSMOS Web</h1>
    </div>
    <br />
    <div className="flex justify-center">
      <Card title={<SyncOutlined />} bordered={false}>
        <p>
          With Orbit, you can view the live or historical orbit of any satellite.
        </p>
      </Card>
      <Card title={<SwapRightOutlined />} bordered={false}>
        <p>
          With Attitude, you can view the live or historical attitude of any satellite.
        </p>
      </Card>
      <Card title={<LineChartOutlined />} bordered={false}>
        <p>
          With Plot, you can view the live or historical data of any satellite.
        </p>
      </Card>
    </div>
  </div>
);

export default Home;
