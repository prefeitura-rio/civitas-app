import React from 'react'
import Cameras from './Cameras'
import { connect } from 'react-redux';

const CamerasContainer = () => {
  return (
    <Cameras />
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
)(CamerasContainer);



