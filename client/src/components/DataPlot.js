import React, { Component } from 'react';
import Navbar from './Global/Navbar';
import CosmosPlotEntry from './Cosmos/CosmosPlotEntry'
import CosmosPlotLive from './Cosmos/CosmosPlotLive'
import ConfigTab from './Cosmos/ConfigTab'
import {  Card } from 'antd';
import io from 'socket.io-client';
import cosmosInfo from './Cosmos/CosmosInfo'
const socket = io(cosmosInfo.socket);

const import_type = {
  NONE: 0,
  JSON: 1,
  SAVED: 2,
  NEW:3
};
const tabList = [{
  key: 'config_tab',
  tab: 'Configure',
}, {
  key: 'plot_tab',
  tab: 'Plot',
}];
async function update_agent_info(cosmos_plot_entry, info){
  await cosmos_plot_entry.update(info);

}
async function get_all_agent_info(cosmos_plot_entries){
  for(var i =0; i < cosmos_plot_entries.length; i++){
    await cosmos_plot_entries[i].setup_agent();
  }
  return;
}

function PlotTabContent(props) {
  var plotentries = props.entries;
  var plot_contents=[];
  for(var i = 0; i < plotentries.length; i++){
    plot_contents.push(<CosmosPlotLive
                key={i}
                id={i}
                info={plotentries[i]}
                />);
  }
  return (
    <div>
      {plot_contents}
    </div>
  );
}

class DataPlot extends Component {
  constructor(props){
    super(props);
      this.state = {
        tab_key:'config_tab',
        config_source: import_type.NONE,
        cosmosPlotEntries:[],
      };


  }
  // componentDidMount() {
  // }
  // componentWillUnmount(){
  //   socket.removeAllListeners('agent update list');
  // }

  onTabChange = (key, type) => {
    // console.log(key, type);
    var state = this.state;
    state.tab_key=key;
    this.setState(state);
  }
  onChangeConfigSource(source){
    this.setState({config_source:source, cosmosPlotEntries:[]});

  }
  updateAgentStatus(entries){

    this.setState({cosmosPlotEntries:entries});
  }
  clearEntries(){
    this.setState({cosmosPlotEntries:[]});
  }
  onClickAddEntry(){
    var entry = new CosmosPlotEntry();
    var entries = this.state.cosmosPlotEntries;
    entries.push(entry);
    this.setState({cosmosPlotEntries:entries});
  }

  importJsonArray(jsonArr){
    // called from JsonForm when a file is selected
    var entries = [];
    for(var i=0; i < jsonArr.length; i++){
      entries.push(new CosmosPlotEntry(jsonArr[i]));
    }
    get_all_agent_info(entries).then((result)=>{
      this.setState({cosmosPlotEntries:entries});
    });

  }
  removeEntry(index){
    /* called from PlotForm::onClickDelete()
     */
    var saved_state = this.state;
    saved_state.cosmosPlotEntries.splice(index,1);
    this.setState(saved_state);
  }
  updateEntry( new_vals){
    /* called from PlotForm::onClickSave()
      new_vals = {  id: ,  agent: ,  values:  }
     */
    var entries = this.state.cosmosPlotEntries;
    update_agent_info(entries[new_vals.id], new_vals).then((result)=>{
      this.setState({cosmosPlotEntries:entries});
    });
  }
  updateConfig(obj){
    var saved_state = this.state;
    saved_state.cosmosPlotEntries[obj.id][obj.key] = obj.value;
    this.setState(saved_state);
  }

  saveConfig(info){
    var jsonArr = [];
    for(var i =0; i < this.state.cosmosPlotEntries.length; i++){
      jsonArr.push(this.state.cosmosPlotEntries[i].to_json());
    }
    var config={
      name:info.name,
      description: info.desc,
      author: info.author,
      created: new Date(),
      edited: new Date(),
      json: jsonArr
    }
    console.log("SAVE CLICKED")
    socket.emit("save plot_config", config);
  }
  updateDBconfig(info){
    var jsonArr = [];
    for(var i =0; i < this.state.cosmosPlotEntries.length; i++){
      jsonArr.push(this.state.cosmosPlotEntries[i].to_json());
    }
    var msg = {
      id: info.id,
      data: {
        name:info.name,
        description: info.desc,
        author: info.author,
        edited: new Date(),
        json: jsonArr
      }
    }
    socket.emit("update plot_config", msg);
  }

  render() {

    const contentList = {
      config_tab:
        <ConfigTab
                      onChangeConfigSource={this.onChangeConfigSource.bind(this)}
                      entries={this.state.cosmosPlotEntries}
                      onChangeJson={this.importJsonArray.bind(this)}
                      updatePlotInfo={this.updateEntry.bind(this)}
                      currentConfigSource={this.state.config_source}
                      addPlot={this.onClickAddEntry.bind(this)}
                      selfDestruct={this.removeEntry.bind(this)}
                      updateValue={this.updateConfig.bind(this)}
                      saveConfig={this.saveConfig.bind(this)}
                      updateAgentStatus={this.updateAgentStatus.bind(this)}
                      clearEntries={this.clearEntries.bind(this)}
                      updateConfigDB={this.updateDBconfig.bind(this)}
                      />,

      plot_tab: <PlotTabContent
                    entries={this.state.cosmosPlotEntries}
                    />
    };


    return (

      <div>
        <Navbar current="dataplot" />
        <div>
          <Card
            style={{ width: '100%' }}
            title="Data Plot"
            tabList={tabList}
            activetabkey={this.state.tab_key}
            onTabChange={(tab_key) => { this.onTabChange(tab_key, 'key'); }}
          >
            {contentList[this.state.tab_key]}
          </Card>

        </div>
      </div>


    );



  }

}

export default DataPlot;
