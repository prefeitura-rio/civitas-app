import React from 'react'
import Login from './Login'
import { connect } from 'react-redux';

const LoginContainer = (props) => {
  return (
    <Login 
    loading={props.loading}
    />
  ) 
}

const mapStateToProps = (state) => {
  return {
   loading:state.cars.loading
  };
};

const mapDispatchToProps = {
  // setMenuSidebar,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LoginContainer);



