import React from 'react'
import Login from './Login'
import { connect } from 'react-redux';

const LoginContainer = (props) => {
  return (
    <Login
      loading={props.loading}
      error={props.error}
      profile={props.profile}
      activeUnderAppBar={props.activeUnderAppBar}
    />
  )
}

const mapStateToProps = (state) => {
  return {
    loading: state.auth.loading,
    error: state.auth.error,
    profile: state.auth.profile,
    activeUnderAppBar: state.active.activeUnderAppBar
  };
};

const mapDispatchToProps = {
  // setMenuSidebar,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LoginContainer);



