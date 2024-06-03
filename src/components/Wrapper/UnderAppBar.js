import { forwardRef } from "react";
import HomeContainer from "../Home/HomeContainer";
import {
  CAMERAS_UNDER_APP_BAR,
  MAPAS_UNDER_APP_BAR,
  PROTOCOLOS_UNDER_APP_BAR,
  CERCO_DIGITAL_UNDER_APP_BAR
} from "../../redux/active/actions";
import ProtocoloContainer from "../Protocolos/ProtocoloContainer";
import CamerasContainer from "../Cameras/CamerasContainer";
import MapasContainer from "../Mapas/MapasContainer";
import CercoDigitalContainer from "../CercoDigital/CercoDigitalContainer";

const UnderAppBar = forwardRef(({ activeUnderAppBar }, ref) => {

  const renderSwitch = (param) => {
    switch (param) {
      case CAMERAS_UNDER_APP_BAR:
        return <CamerasContainer />;
      case MAPAS_UNDER_APP_BAR:
        return <MapasContainer />;
      case PROTOCOLOS_UNDER_APP_BAR:
        return <ProtocoloContainer />;
      case CERCO_DIGITAL_UNDER_APP_BAR:
        return <CercoDigitalContainer />;
      default:
        return <CercoDigitalContainer />;
    }
  };

  return (
    <>
      {renderSwitch(activeUnderAppBar)}
    </>
  );
});

export default UnderAppBar;
