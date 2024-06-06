import React from 'react'
import AppBarNav from './AppBarNav'
import { connect } from 'react-redux';
import { setActiveUnderAppBar } from '../../redux/active/actions';

const AppBarNavContainer = (props) => {
  return (
    <AppBarNav
      setActiveUnderAppBar={props.setActiveUnderAppBar}
      activeUnderAppBar={props.activeUnderAppBar}
      profile={props.profile}
    />
  )
}

const mapStateToProps = (state) => {
  return {
    activeUnderAppBar: state.active.activeUnderAppBar,
    profile:state.auth.profile

  };
};

const mapDispatchToProps = {
  setActiveUnderAppBar
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AppBarNavContainer);



