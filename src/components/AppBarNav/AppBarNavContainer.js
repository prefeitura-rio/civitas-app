import React from 'react'
import AppBarNav from './AppBarNav'
import { connect } from 'react-redux';
import { setActiveUnderAppBar } from '../../redux/active/actions';

const AppBarNavContainer = (props) => {
  return (
    <AppBarNav
      setActiveUnderAppBar={props.setActiveUnderAppBar}
      activeUnderAppBar={props.activeUnderAppBar}
    />
  )
}

const mapStateToProps = (state) => {
  return {
    activeUnderAppBar: state.active.activeUnderAppBar

  };
};

const mapDispatchToProps = {
  setActiveUnderAppBar
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AppBarNavContainer);



