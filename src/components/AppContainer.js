import { useEffect } from "react";
import App from "./App";
import { connect, useDispatch } from "react-redux";
import { loadActiveCalls } from "../redux/calls/actions";

const AppContainer = (props) => {

  const dispatch = useDispatch();
  useEffect(() => {
    // dispatch(loadActiveCalls());
  }, []);

  return <App
  loading={props.loading}
  error={props.error}
  />;
};

const mapStateToProps = (state) => {
  return {
    loading:state.cars.loading,
    error:state.cars.error
  };
};

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(AppContainer);
