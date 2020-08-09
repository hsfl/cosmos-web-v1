## Activity

Shows the incoming activity from the web socket and displays time elapsed
from the last data retrieval.

This component does not have any props.

## AgentList

Retrieves the agent list and displays it in a table.
Also displays the timestamp of the agent's last heartbeat.

prop | type | default | required | description
---- | :----: | :-------: | :--------: | -----------
**node** | `String` | `''` | :x: | Name of the node to display. If empty string, display all

## Attitude

Visualizes the attitude of an object through a Babylon.js simulation.
It contains a mesh sphere around a model of the satellite, along with XYZ axes.
On the bottom, it displays a table containing the current x, y, z and w vector values.

prop | type | default | required | description
---- | :----: | :-------: | :--------: | -----------
**attitudes** | `Array[]<Shape>` | `[]` | :x: | Currently displayed attitudes
**attitudes[].dataKey** | `String` |  | :x: | Data key to retrieve data from
**attitudes[].name** | `String` |  | :x: | Name of the attitude display
**attitudes[].nodeProcess** | `String` |  | :x: | node:process to look at for retrieving attitude data
**name** | `String` | `''` | :x: | Name of the component at the top
**showStatus** | `Boolean` | `false` | :x: | Whether to show a circular indicator of the status of the component
**status** | `String` | `'error'` | :x: | The type of badge to show if showStatus is true (see the ant design badges component)

## Commands

Send commands to agents through agent mongo web socket. Simulates a CLI.
Gives the ability to select commonly used node:process; appends this value to after the `agent`
command.
Allows for running agent commands. Logs inputs and ouputs in the white box above the input box.

prop | type | default | required | description
---- | :----: | :-------: | :--------: | -----------
**nodes** | `Array[]<String>` |  | :white_check_mark: | List of nodes available to be able to send commands to

## CommandEditor

Allows user to create commands to store in the database.

prop | type | default | required | description
---- | :----: | :-------: | :--------: | -----------
**nodes** | `Array[]<String>` |  | :white_check_mark: | List of nodes available to be able to add commands to

## DisplayValue

Displays a specified live value from an agent.
Updates values every agent heartbeat.

prop | type | default | required | description
---- | :----: | :-------: | :--------: | -----------
**displayValues** | `Array[]<Shape>` | `[]` | :x: | The values to display
**displayValues[].dataKey** | `String` |  | :x: | The data key to pull the value from
**displayValues[].dataKeyLowerThreshold** | `Number` |  | :x: | Emit warning if data key is below threshold
**displayValues[].dataKeyUpperThreshold** | `Number` |  | :x: | Emit warning if data key exceeds threshold
**displayValues[].name** | `String` |  | :x: | Display name of the value
**displayValues[].nodeProcess** | `String` |  | :x: | the node:process to pull the value from
**displayValues[].processDataKey** | `Function` |  | :x: | The function to put the value through to manipulate it
**displayValues[].timeDataKey** | `String` |  | :x: | The data key to pull the time from
**displayValues[].unit** | `String` |  | :x: | The unit of the
**name** | `String` | `''` | :x: | Name of the component to display at the time

## Divider

A simple gray line divider.

This component does not have any props.

## Chart

Display data on a chart using plot.ly. Allows for various plot.ly configurations.
On the top bar, it displays the data that is currently being displayed on the chart.
It allows for custom configuration such as the chart name,
data limit amount and the data key to display on the x axis.

prop | type | default | required | description
---- | :----: | :-------: | :--------: | -----------
**children** | `ReactNode` | `null` | :x: | Children node
**dataLimit** | `Number` | `5000` | :x: | Specify limit on how many data points can be displayed per key
**defaultYAxis** | `String` | `null` | :x: | Axis range view of the chart
**name** | `String` | `''` | :x: | Name of the component to display at the top
**plots** | `Array[]<Shape>` | `[]` | :x: | Plot options for each chart
**plots[].YDataKey** | `String` |  | :x: | Data key to plot on the y-axis
**plots[].live** | `Boolean` |  | :x: | Whether the chart displays live values
**plots[].marker** | `Shape` |  | :x: | 
**plots[].marker.color** | `String` |  | :x: | Chart marker color
**plots[].mode** | `String` |  | :x: | Plot.ly chart mode
**plots[].name** | `String` |  | :x: | Chart name/title
**plots[].nodeProcess** | `String` |  | :x: | Name of the node:process to listen to
**plots[].processYDataKey** | `Function` |  | :x: | Function to modify the Y Data key
**plots[].timeDataKey** | `String` |  | :x: | Time data key of Y Data Key
**plots[].type** | `String` |  | :x: | Plot.ly chart type
**plots[].x** | `Array[]<*>` |  | :x: | Array of chart y values
**plots[].y** | `Array[]<*>` |  | :x: | Array of chart x values
**polar** | `Boolean` | `false` | :x: | Specify whether this chart is a polar or cartesian plot
**showZero** | `Boolean` | `false` | :x: | Ability to show the zero values or not

## Example

This component does not have any props.

## App

This component does not have any props.

## CesiumGlobe

Displays a globe with the orbit and orbit history using Resium (Cesium).
Retrieves location data and displays a model in the location.
Stores the location data and displays the path taken by the model.
Can overlay shapes over an area of the globe.
At the bottom, displays the current location.

prop | type | default | required | description
---- | :----: | :-------: | :--------: | -----------
**coordinateSystem** | `String` | `'cartesian'` | :x: | Geodetic or cartesian
**name** | `String` | `''` | :x: | Name of the component to display at the time
**orbits** | `Array[]<Shape>` | `[]` | :x: | Default orbits to display
**orbits[].XDataKey** | `String` |  | :x: | Cartesian X value
**orbits[].YDataKey** | `String` |  | :x: | Cartesian Y value
**orbits[].ZDataKey** | `String` |  | :x: | Cartesian Z value
**orbits[].live** | `Boolean` |  | :x: | Whether or not the orbit is live
**orbits[].modelFileName** | `String` |  | :x: | Model to use on globe
**orbits[].name** | `String` |  | :x: | Name of satellite
**orbits[].nodeProcess** | `String` |  | :x: | Node process to look at for xyz data
**orbits[].processXDataKey** | `Function` |  | :x: | Process X function
**orbits[].processYDataKey** | `Function` |  | :x: | Process Y function
**orbits[].processZDataKey** | `Function` |  | :x: | Process Z function
**orbits[].timeDataKey** | `String` |  | :x: | Time data key to look at for data
**overlays** | `Array[]<Shape>` | `[]` | :x: | Store overlays on map (geocoloring)
**overlays[].color** | `String` |  | :x: | Color of the overlay
**overlays[].geoJson** | `Shape` |  | :x: | GeoJSON code
**showStatus** | `Boolean` | `false` | :x: | Whether to show a circular indicator of the status of the component
**status** | `String` | `'error'` | :x: | The type of badge to show if showStatus is true (see the ant design badges component)

## Image

Display an image from public/<node>/<file>

prop | type | default | required | description
---- | :----: | :-------: | :--------: | -----------
**file** | `String` |  | :white_check_mark: | File name in public/<node>
**name** | `String` |  | :white_check_mark: | Name of component
**node** | `String` |  | :white_check_mark: | Node to pull image from

## MissionEventsDisplay

Display previously queued and/or executed commands by agent exec in a table.
Shows the create date, execute date, event details, and output.

prop | type | default | required | description
---- | :----: | :-------: | :--------: | -----------
**nodes** | `Array[]<String>` |  | :white_check_mark: | Nodes to retrieve commands from and to display

## Macro

Retrieves the agent list and displays it in a table.
Also displays the timestamp of the agent's last heartbeat.

This component does not have any props.

## Activity

Retrieves data from a web socket. Displays an event along with the timestamp in a table.

This component does not have any props.

## Replacement

Retrieves the agent list and displays it in a table.
Also displays the timestamp of the agent's last heartbeat.

This component does not have any props.

## SOH

Displays a specified live value from an agent.
Updates values every agent heartbeat.

prop | type | default | required | description
---- | :----: | :-------: | :--------: | -----------
**dateRange** | `Number` | `-1` | :x: | Date range to retrieve for SOH
**name** | `String` | `''` | :x: | Name of the component to display at the time

## Sequence

Component to handle pre-defined sequences of commands to run agent commands.

prop | type | default | required | description
---- | :----: | :-------: | :--------: | -----------
**sequences** | `Array[]<Shape>` | `[]` | :x: | Definition of sequences
**sequences[].button** | `String` |  | :x: | Name of sequence to display on button
**sequences[].sequence** | `Array[]<String>` |  | :x: | Definition of sequence of commands to run on button press

## SetValues

Component to conveniently get and set values via an agent command.

prop | type | default | required | description
---- | :----: | :-------: | :--------: | -----------
**formItems** | `ReactNode` | `null` | :x: | Form node
**liveOnly** | `Boolean` | `true` | :x: | Whether the component can display only live data. Hides/shows the live/past switch.
**name** | `String` | `''` | :x: | Name of the component to display at the time
**node** | `String` |  | :white_check_mark: | The node of the agent to set the values
**proc** | `String` |  | :white_check_mark: | The process of the agent to set the values
**showStatus** | `Boolean` | `false` | :x: | Whether to show a circular indicator of the status of the component
**status** | `String` | `'error'` | :x: | The type of badge to show if showStatus is true (see the ant design badges component)
**subheader** | `String` | `null` | :x: | Supplementary information below the name
**values** | `Shape` |  | :white_check_mark: | Values to change

## SatellitePasses

Displays required data for a future pass of a satellite.

This component does not have any props.

