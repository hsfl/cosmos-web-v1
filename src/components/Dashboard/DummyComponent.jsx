import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

function DummyComponent({
	name,
	description,
}){
	/**const [nameState, setNamestate] = useState(name);*/
    
	
}
	
DummyComponent.propTypes = {
	/** Title of component */
	name: propType.string,
	/** Description of component */
	description: propType.string,
}

export default React.memo(DummyComponent);