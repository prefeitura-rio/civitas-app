import React from 'react'
import AppBarNav from './AppBarNav'
import { connect } from 'react-redux';
import { setActiveUnderAppBar } from '../../redux/active/actions';

const AppBarNavContainer = (props) => {
  return (
    <AppBarNav
      setActiveUnderAppBar={props.setActiveUnderAppBar}
    />
  )
}

const mapStateToProps = (state) => {
  return {

  };
};

const mapDispatchToProps = {
  setActiveUnderAppBar
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AppBarNavContainer);



