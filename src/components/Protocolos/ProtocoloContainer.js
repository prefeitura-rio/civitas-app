import React from 'react'
import Protocolos from './Protocolos'
import { connect } from 'react-redux';

const ProtocolosContainer = () => {
  return (
    <Protocolos />
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
)(ProtocolosContainer);



