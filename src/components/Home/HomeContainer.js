import React from 'react'
import Home from './Home'
import { connect } from 'react-redux';

const HomeContainer = () => {
  return (
    <Home />
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
)(HomeContainer);



