import React from 'react'
import CercoDigital from './CercoDigital'
import { connect } from 'react-redux';

const CercoDigitalContainer = (props) => {
  return (
    <CercoDigital 
    cars={props.cars}
    loading={props.loading}
    />
  ) 
}

const mapStateToProps = (state) => {
  return {
   cars:state.cars.all,
   loading:state.cars.loading
  };
};

const mapDispatchToProps = {
  // setMenuSidebar,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CercoDigitalContainer);



