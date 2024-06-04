import React from 'react';
import { Container } from '@mui/material';
import UnderAppBarContainer from './Wrapper/UnderAppBarContainer';
import AppBarNavContainer from './AppBarNav/AppBarNavContainer';
import Loading from '../utils/Loading';
import Error from '../utils/Error';

function App({loading,error}) {
  return (
    <Container  maxWidth="auto" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: 'black'}}>
     {loading && <Loading loading={loading} />}
     {/* {error && <Error error={error} />} */}
      <AppBarNavContainer />
      <UnderAppBarContainer />
    </Container>
  );
}

export default App;