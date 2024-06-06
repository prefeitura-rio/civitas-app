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
    error_message={props.error_message}
    error_status={props.error_status}
  />;
};

const mapStateToProps = (state) => {
  return {
    loading: state.cars.loading,
    // error:state.cars.error
    error_message: state.error.message,
    error_status: state.error.status
  };
};

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(AppContainer);
