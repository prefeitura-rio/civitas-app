import UnderAppBar from "./UnderAppBar";
import { connect} from "react-redux";

const UnderAppBarContainer = (props) => {

  return (
      <UnderAppBar
        activeUnderAppBar={props.activeUnderAppBar}
        profile={props.profile}
      />
  );
};

const mapStateToProps = (state) => {
  return {
    activeUnderAppBar: state.active.activeUnderAppBar,
    profile: state.auth.profile,
  };
};

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UnderAppBarContainer);
