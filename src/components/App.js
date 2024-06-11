import React from 'react';
import { Container } from '@mui/material';
import UnderAppBarContainer from './Wrapper/UnderAppBarContainer';
import AppBarNavContainer from './AppBarNav/AppBarNavContainer';
import Loading from '../utils/Loading';
import SnackBar from '../utils/SnackBar';

function App({ loading, error_message, error_status, error_severity }) {
  return (
    <Container maxWidth="auto" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: 'black' }}>
      {loading && <Loading loading={loading} />}
      {error_message && <SnackBar message={error_status + " " + error_message} severity={error_severity} />}
      <AppBarNavContainer />
      <UnderAppBarContainer />
    </Container>
  );
}

export default App;