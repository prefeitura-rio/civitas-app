import React from 'react'
import Mapas from './Mapas'
import { connect } from 'react-redux';

const MapasContainer = () => {
  return (
    <Mapas />
  )
}

const mapStateToProps = (state) => {
  return {
    // menuSidebar: state.active.menuSidebar,
    // descriptionData: state.place.descriptionData,
    // content: state.place.content,
  };
};

const mapDispatchToProps = {
  // setMenuSidebar,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MapasContainer);



