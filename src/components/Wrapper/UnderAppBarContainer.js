import UnderAppBar from "./UnderAppBar";
import { connect} from "react-redux";

const UnderAppBarContainer = (props) => {

  return (
      <UnderAppBar
        activeUnderAppBar={props.activeUnderAppBar}
      />
  );
};

const mapStateToProps = (state) => {
  return {
    activeUnderAppBar: state.active.activeUnderAppBar
  };
};

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UnderAppBarContainer);
